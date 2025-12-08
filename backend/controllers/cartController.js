const { Cart, CartItem, Product, ProductVariant, ProductImage } = require('../models');
const { Op } = require('sequelize');

// Get cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            include: [{
              model: ProductImage,
              as: 'images',
              where: { is_primary: true },
              required: false,
              attributes: ['image_url']
            }],
            attributes: ['id', 'name', 'base_price', 'discount_percent', 'brand']
          },
          {
            model: ProductVariant,
            as: 'variant',
            attributes: ['id', 'variant_name', 'price_adjustment', 'stock_quantity']
          }
        ]
      }]
    });

    // Nếu chưa có cart, tạo mới
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
      cart = await Cart.findByPk(cart.id, {
        include: [{
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [{
                model: ProductImage,
                as: 'images',
                where: { is_primary: true },
                required: false,
                attributes: ['image_url']
              }]
            },
            {
              model: ProductVariant,
              as: 'variant'
            }
          ]
        }]
      });
    }

    // Tính tổng tiền
    const items = cart.items || [];
    let total = 0;

    items.forEach(item => {
      const product = item.product;
      const variant = item.variant;
      const basePrice = parseFloat(product.base_price);
      const discount = parseFloat(product.discount_percent) || 0;
      const priceAdjustment = variant ? parseFloat(variant.price_adjustment) : 0;
      
      const finalPrice = (basePrice * (1 - discount / 100) + priceAdjustment) * item.quantity;
      total += finalPrice;
    });

    res.json({
      success: true,
      data: {
        cart: {
          id: cart.id,
          items: items.map(item => {
            const product = item.product;
            const variant = item.variant;
            const basePrice = parseFloat(product.base_price);
            const discount = parseFloat(product.discount_percent) || 0;
            const priceAdjustment = variant ? parseFloat(variant.price_adjustment) : 0;
            const finalPrice = basePrice * (1 - discount / 100) + priceAdjustment;

            return {
              id: item.id,
              product: {
                id: product.id,
                name: product.name,
                brand: product.brand,
                image: product.images?.[0]?.image_url || null,
                basePrice,
                discount
              },
              variant: variant ? {
                id: variant.id,
                name: variant.variant_name,
                priceAdjustment
              } : null,
              quantity: item.quantity,
              unitPrice: parseFloat(finalPrice.toFixed(2)),
              subtotal: parseFloat((finalPrice * item.quantity).toFixed(2))
            };
          }),
          total: parseFloat(total.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
const addItem = async (req, res, next) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;

    // Kiểm tra product
    const product = await Product.findByPk(product_id);
    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại hoặc đã ngừng bán'
      });
    }

    // Kiểm tra variant nếu có
    if (variant_id) {
      const variant = await ProductVariant.findOne({
        where: { id: variant_id, product_id, status: 'active' }
      });
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Biến thể sản phẩm không tồn tại'
        });
      }
      if (variant.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng sản phẩm không đủ'
        });
      }
    }

    // Lấy hoặc tạo cart
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }

    // Kiểm tra item đã tồn tại
    const existingItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id,
        variant_id: variant_id || null
      }
    });

    if (existingItem) {
      // Cập nhật quantity
      const newQuantity = existingItem.quantity + quantity;
      await existingItem.update({ quantity: newQuantity });
    } else {
      // Tạo mới
      await CartItem.create({
        cart_id: cart.id,
        product_id,
        variant_id: variant_id || null,
        quantity
      });
    }

    res.json({
      success: true,
      message: 'Thêm vào giỏ hàng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }

    const item = await CartItem.findOne({
      where: { id, cart_id: cart.id }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại trong giỏ hàng'
      });
    }

    // Kiểm tra stock nếu có variant
    if (item.variant_id) {
      const variant = await ProductVariant.findByPk(item.variant_id);
      if (variant.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng sản phẩm không đủ'
        });
      }
    }

    await item.update({ quantity });

    res.json({
      success: true,
      message: 'Cập nhật giỏ hàng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
const removeItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }

    const item = await CartItem.findOne({
      where: { id, cart_id: cart.id }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại trong giỏ hàng'
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }

    res.json({
      success: true,
      message: 'Xóa giỏ hàng thành công'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};

