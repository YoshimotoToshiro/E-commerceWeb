const { Order, OrderItem, Cart, CartItem, Product, ProductVariant, Promotion, User, OrderStatusHistory } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Create order
const createOrder = async (req, res, next) => {
  const transaction = await require('../models').sequelize.transaction();
  
  try {
    const {
      shipping_address,
      shipping_phone,
      payment_method,
      promotion_code
    } = req.body;

    // Lấy cart
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product'
          },
          {
            model: ProductVariant,
            as: 'variant'
          }
        ]
      }],
      transaction
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    // Tính tổng tiền
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;
      const basePrice = parseFloat(product.base_price);
      const discount = parseFloat(product.discount_percent) || 0;
      const priceAdjustment = variant ? parseFloat(variant.price_adjustment) : 0;
      const unitPrice = basePrice * (1 - discount / 100) + priceAdjustment;
      const subtotal = unitPrice * item.quantity;

      // Kiểm tra stock
      if (variant && variant.stock_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.name} - ${variant.variant_name} không đủ số lượng`
        });
      }

      totalAmount += subtotal;

      orderItems.push({
        product_id: product.id,
        variant_id: variant?.id || null,
        product_name: product.name,
        variant_name: variant?.variant_name || null,
        quantity: item.quantity,
        unit_price: parseFloat(unitPrice.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2))
      });
    }

    // Áp dụng promotion nếu có
    let promotion = null;
    let discountAmount = 0;

    if (promotion_code) {
      promotion = await Promotion.findOne({
        where: {
          code: promotion_code,
          start_date: { [Op.lte]: new Date() },
          end_date: { [Op.gte]: new Date() },
          [Op.or]: [
            { usage_limit: null },
            sequelize.literal('used_count < usage_limit')
          ]
        },
        transaction
      });

      if (promotion && totalAmount >= parseFloat(promotion.min_order_value)) {
        if (promotion.discount_type === 'percentage') {
          discountAmount = totalAmount * (parseFloat(promotion.discount_value) / 100);
        } else {
          discountAmount = parseFloat(promotion.discount_value);
        }
        discountAmount = Math.min(discountAmount, totalAmount);
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // Tạo order
    const order = await Order.create({
      order_code: `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`,
      user_id: req.user.id,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      promotion_id: promotion?.id || null,
      final_amount: parseFloat(finalAmount.toFixed(2)),
      status: 'pending',
      payment_method,
      payment_status: 'pending',
      shipping_address,
      shipping_phone,
      order_date: new Date()
    }, { transaction });

    // Tạo order items
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item
      }, { transaction });

      // Giảm stock và cập nhật status sản phẩm nếu cần
      if (item.variant_id) {
        const variant = await ProductVariant.findByPk(item.variant_id, { transaction });
        const newStock = variant.stock_quantity - item.quantity;
        await variant.update({
          stock_quantity: Math.max(0, newStock)
        }, { transaction });
        
        // Nếu stock = 0, cập nhật status variant thành inactive
        if (newStock <= 0) {
          await variant.update({ status: 'inactive' }, { transaction });
        }
        
        // Kiểm tra và cập nhật status sản phẩm
        const product = await Product.findByPk(item.product_id, { transaction });
        
        if (product) {
          // Lấy tất cả variants active của sản phẩm
          const allVariants = await ProductVariant.findAll({
            where: {
              product_id: product.id,
              status: 'active'
            },
            transaction
          });
          
          // Tính tổng stock từ các variant active
          const totalStock = allVariants.reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0);
          
          // Nếu tổng stock = 0, chuyển sản phẩm thành out_of_stock
          if (totalStock <= 0 && product.status !== 'out_of_stock') {
            await product.update({ status: 'out_of_stock' }, { transaction });
          }
        }
      }
    }

    // Tăng used_count của promotion
    if (promotion) {
      await promotion.update({
        used_count: promotion.used_count + 1
      }, { transaction });
    }

    // Tạo status history
    await OrderStatusHistory.create({
      order_id: order.id,
      status: 'pending',
      updated_by: req.user.id,
      notes: 'Đơn hàng được tạo'
    }, { transaction });

    // Xóa cart
    await CartItem.destroy({
      where: { cart_id: cart.id }
    }, { transaction });

    await transaction.commit();

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      table_name: 'orders',
      record_id: order.id,
      description: `Tạo đơn hàng: ${order.order_code}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: { order }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get orders
const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    // User chỉ xem đơn của mình, Employee+ xem tất cả
    if (req.user.role === 'user') {
      where.user_id = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const where = { id };
    
    // User chỉ xem đơn của mình
    if (req.user.role === 'user') {
      where.user_id = req.user.id;
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'email', 'phone', 'address']
        },
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'username', 'full_name'],
          required: false
        },
        {
          model: Promotion,
          as: 'promotion',
          attributes: ['id', 'code', 'name', 'discount_type', 'discount_value'],
          required: false
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'brand'],
            include: [{
              model: require('../models').ProductImage,
              as: 'images',
              where: { is_primary: true },
              required: false,
              attributes: ['image_url']
            }]
          }]
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [{
            model: User,
            as: 'updater',
            attributes: ['id', 'username', 'full_name'],
            required: false
          }],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Confirm received order (User)
const confirmReceived = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra đơn hàng thuộc về user
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này'
      });
    }

    // Chỉ cho phép xác nhận khi đơn hàng đang ở trạng thái shipping
    if (order.status !== 'shipping') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận đã nhận hàng khi đơn hàng đang được giao'
      });
    }

    const oldStatus = order.status;
    await order.update({ status: 'delivered' });

    // Tạo status history
    await OrderStatusHistory.create({
      order_id: order.id,
      status: 'delivered',
      updated_by: req.user.id,
      notes: `Khách hàng xác nhận đã nhận hàng`
    });

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'orders',
      record_id: order.id,
      description: `Khách hàng xác nhận đã nhận đơn hàng ${order.order_code}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Đã xác nhận nhận hàng thành công',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (Employee+)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const oldStatus = order.status;
    await order.update({ status });

    // Nếu là employee cập nhật, lưu employee_id
    if (req.user.role === 'employee' || req.user.role === 'manager') {
      await order.update({ employee_id: req.user.id });
    }

    // Tạo status history
    await OrderStatusHistory.create({
      order_id: order.id,
      status,
      updated_by: req.user.id,
      notes: notes || `Chuyển từ ${oldStatus} sang ${status}`
    });

    // Nếu hủy đơn, hoàn lại stock và cập nhật status sản phẩm
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const items = await OrderItem.findAll({ where: { order_id: order.id } });
      for (const item of items) {
        if (item.variant_id) {
          const variant = await ProductVariant.findByPk(item.variant_id);
          const newStock = variant.stock_quantity + item.quantity;
          await variant.update({
            stock_quantity: newStock,
            status: newStock > 0 ? 'active' : 'inactive'
          });
          
          // Kiểm tra và cập nhật status sản phẩm
          const product = await Product.findByPk(item.product_id);
          if (product) {
            // Lấy tất cả variants active của sản phẩm
            const allVariants = await ProductVariant.findAll({
              where: {
                product_id: product.id,
                status: 'active'
              }
            });
            
            // Tính tổng stock từ các variant active
            const totalStock = allVariants.reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0);
            
            // Nếu tổng stock > 0 và status là out_of_stock, chuyển về active
            if (totalStock > 0 && product.status === 'out_of_stock') {
              await product.update({ status: 'active' });
            }
          }
        }
      }
    }

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'orders',
      record_id: order.id,
      description: `Cập nhật trạng thái đơn hàng ${order.order_code}: ${oldStatus} → ${status}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  confirmReceived,
  updateOrderStatus
};

