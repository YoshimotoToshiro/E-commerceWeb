const { Product, Category, Supplier, ProductImage, ProductVariant, Review, OrderItem, Order, CartItem, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper: Tính tổng stock từ variants
const calculateTotalStockFromVariants = (variants) => {
  if (!variants || !Array.isArray(variants)) return 0;
  return variants
    .filter(v => v.status === 'active')
    .reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0);
};

// Helper: Xác định status dựa trên tổng stock từ variants
const resolveProductStatus = (status, totalStockFromVariants) => {
  if (status === 'out_of_stock') return 'out_of_stock';
  if (totalStockFromVariants <= 0) return 'out_of_stock';
  return status || 'active';
};

// Get all products với search, filter, pagination
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      priceMin,
      priceMax,
      status,
      is_featured,
      page = 1,
      limit = 12,
      sort = 'createdAt',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    // Nếu là manager/admin thì có thể xem tất cả, nếu không thì chỉ active và không hết hàng
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
      if (status) {
        where.status = status;
      }
    } else {
      // Người dùng thường chỉ thấy sản phẩm active (không hết hàng)
      where.status = 'active';
    }

    // Search by name
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    // Filter by category
    if (category) {
      where.category_id = category;
    }

    // Filter by brand
    if (brand) {
      where.brand = {
        [Op.like]: `%${brand}%`
      };
    }

    // Filter by featured
    if (is_featured !== undefined) {
      where.is_featured = is_featured === 'true' || is_featured === true;
    }

    // Filter by price (tính theo giá sau discount)
    let priceFilter = {};
    if (priceMin || priceMax) {
      priceFilter = {
        [Op.and]: [
          priceMin ? sequelize.literal(`(base_price * (1 - discount_percent / 100)) >= ${priceMin}`) : null,
          priceMax ? sequelize.literal(`(base_price * (1 - discount_percent / 100)) <= ${priceMax}`) : null
        ].filter(Boolean)
      };
    }

    // Lấy tất cả sản phẩm để tính totalStock và filter (không phân trang)
    const isManagerOrAdmin = req.user && (req.user.role === 'manager' || req.user.role === 'admin');
    
    const allProducts = await Product.findAll({
      where: { ...where, ...priceFilter },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        },
        {
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          required: false,
          attributes: ['image_url']
        },
        {
          model: Review,
          as: 'reviews',
          where: { status: 'approved' },
          required: false,
          attributes: ['rating']
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { status: 'active' },
          required: false,
          attributes: ['id', 'stock_quantity', 'status']
        }
      ],
      order: [[sort, order]],
      distinct: true
    });

    // Tính rating trung bình và số lượng đã bán cho tất cả sản phẩm
    const allProductIds = allProducts.map(p => p.id);
    
    // Tính số lượng đã bán cho tất cả sản phẩm bằng raw query
    let soldMap = {};
    if (allProductIds.length > 0) {
      const soldQuantities = await sequelize.query(`
        SELECT 
          oi.product_id,
          SUM(oi.quantity) as total_sold
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id IN (:productIds)
          AND o.status != 'cancelled'
        GROUP BY oi.product_id
      `, {
        replacements: { productIds: allProductIds },
        type: sequelize.QueryTypes.SELECT
      });

      soldQuantities.forEach(item => {
        soldMap[item.product_id] = parseInt(item.total_sold || 0);
      });
    }

    // Map và filter tất cả sản phẩm
    const allProcessedProducts = allProducts
      .map(product => {
        const productJson = product.toJSON();
        const totalStock = calculateTotalStockFromVariants(productJson.variants);
        productJson.status = resolveProductStatus(productJson.status, totalStock);
        const ratings = productJson.reviews?.map(r => r.rating) || [];
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : 0;
        const reviewCount = ratings.length;

        // Tính giá sau discount
        const finalPrice = productJson.base_price * (1 - productJson.discount_percent / 100);
        
        return {
          ...productJson,
          totalStock,
          avgRating: parseFloat(avgRating),
          reviewCount,
          finalPrice: parseFloat(finalPrice.toFixed(2)),
          totalSold: soldMap[product.id] || 0
        };
      })
      .filter(product => {
        // Người dùng thường không thấy sản phẩm hết hàng
        if (!isManagerOrAdmin && (product.status === 'out_of_stock' || product.totalStock <= 0)) {
          return false;
        }
        return true;
      });

    // Tính pagination từ danh sách đã filter
    const filteredTotal = allProcessedProducts.length;
    const totalPages = Math.ceil(filteredTotal / parseInt(limit));
    
    // Áp dụng phân trang
    const paginatedProducts = allProcessedProducts.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          total: filteredTotal,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: totalPages || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'contact_person', 'email']
        },
        {
          model: ProductImage,
          as: 'images',
          order: [['display_order', 'ASC'], ['is_primary', 'DESC']],
          attributes: ['id', 'image_url', 'is_primary', 'display_order']
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { status: 'active' },
          required: false,
          attributes: ['id', 'variant_name', 'sku', 'stock_quantity', 'price_adjustment', 'status']
        },
        {
          model: Review,
          as: 'reviews',
          where: { status: 'approved' },
          required: false,
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'username', 'full_name']
          }],
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Nếu không phải manager/admin thì chỉ cho xem sản phẩm active (không hết hàng)
    const isManagerOrAdmin = req.user && (req.user.role === 'manager' || req.user.role === 'admin');
    if (!isManagerOrAdmin && product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const productJson = product.toJSON();
    const totalStock = calculateTotalStockFromVariants(productJson.variants);
    productJson.status = resolveProductStatus(productJson.status, totalStock);
    
    // Tính rating
    const ratings = productJson.reviews?.map(r => r.rating) || [];
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    // Tính tổng số lượng đã bán (loại trừ đơn bị hủy)
    const soldResult = await OrderItem.findOne({
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('quantity')), 0), 'totalSold']
      ],
      where: { product_id: id },
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          status: {
            [Op.ne]: 'cancelled'
          }
        }
      }],
      raw: true
    });
    const totalSold = parseInt(soldResult?.totalSold || 0, 10);

    // Tính giá sau discount
    const finalPrice = productJson.base_price * (1 - productJson.discount_percent / 100);

    res.json({
      success: true,
      data: {
        ...productJson,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        avgRating: parseFloat(avgRating),
        reviewCount: ratings.length,
        totalSold
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create product (Manager+)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category_id,
      supplier_id,
      brand,
      description,
      status,
      base_price,
      discount_percent,
      warranty_period,
      warranty_description,
      is_featured,
      images,
      variants
    } = req.body;

    // Validate: Mỗi sản phẩm phải có ít nhất 1 biến thể
    const validVariants = variants && Array.isArray(variants) 
      ? variants.filter(v => v.variant_name && v.variant_name.trim() !== '')
      : [];
    
    if (validVariants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mỗi sản phẩm phải có ít nhất 1 biến thể (phân loại)'
      });
    }

    // Tính tổng stock từ variants để xác định status
    const totalStock = validVariants.reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0);
    const requestedStatus = status || 'active';
    const normalizedStatus = resolveProductStatus(requestedStatus, totalStock);

    // Tạo product
    const product = await Product.create({
      name,
      category_id,
      supplier_id,
      brand,
      description,
      base_price,
      discount_percent: discount_percent || 0,
      warranty_period,
      warranty_description,
      status: normalizedStatus,
      is_featured: is_featured || false
    });

    // Tạo images
    if (images && images.length > 0) {
      await ProductImage.bulkCreate(
        images.map((img, index) => ({
          product_id: product.id,
          image_url: img.url,
          is_primary: img.is_primary || index === 0,
          display_order: img.display_order || index
        }))
      );
    }

    // Tạo variants (bắt buộc)
      await ProductVariant.bulkCreate(
      validVariants.map(variant => ({
          product_id: product.id,
          variant_name: variant.variant_name,
          sku: variant.sku,
          stock_quantity: variant.stock_quantity || 0,
          price_adjustment: variant.price_adjustment || 0,
          status: 'active'
        }))
      );

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      table_name: 'products',
      record_id: product.id,
      description: `Tạo sản phẩm: ${name}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// Update product (Manager+)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      category_id,
      supplier_id,
      brand,
      description,
      base_price,
      discount_percent,
      warranty_period,
      warranty_description,
      status,
      is_featured,
      images,
      variants
    } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Validate: Mỗi sản phẩm phải có ít nhất 1 biến thể
    const validVariants = variants && Array.isArray(variants)
      ? variants.filter(v => v.variant_name && v.variant_name.trim() !== '')
      : [];
    
    if (validVariants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mỗi sản phẩm phải có ít nhất 1 biến thể (phân loại)'
      });
    }

    // Tính tổng stock từ variants để xác định status
    const totalStock = validVariants.reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0);
    const incomingStatus = status ?? product.status;
    const normalizedStatus = resolveProductStatus(incomingStatus, totalStock);

    // Update product basic info
    await product.update({
      name,
      category_id,
      supplier_id,
      brand,
      description,
      base_price,
      discount_percent,
      warranty_period,
      warranty_description,
      status: normalizedStatus,
      is_featured: is_featured !== undefined ? is_featured : product.is_featured
    });

    // Update images: xóa tất cả và tạo lại
    if (images && Array.isArray(images)) {
      await ProductImage.destroy({ where: { product_id: product.id } });
      if (images.length > 0) {
        await ProductImage.bulkCreate(
          images.map((img, index) => ({
            product_id: product.id,
            image_url: img.url,
            is_primary: img.is_primary || index === 0,
            display_order: img.display_order || index
          }))
        );
      }
    }

    // Update variants: xóa tất cả và tạo lại (bắt buộc có ít nhất 1)
      await ProductVariant.destroy({ where: { product_id: product.id } });
        await ProductVariant.bulkCreate(
      validVariants.map(variant => ({
            product_id: product.id,
            variant_name: variant.variant_name,
            sku: variant.sku,
            stock_quantity: variant.stock_quantity || 0,
            price_adjustment: variant.price_adjustment || 0,
            status: 'active'
          }))
        );

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'products',
      record_id: product.id,
      description: `Cập nhật sản phẩm: ${product.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (Manager+) - Hard delete
const deleteProduct = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const productName = product.name;
    const productId = product.id;

    // Xóa các bản ghi liên quan trước khi xóa sản phẩm
    // 1. Xóa CartItem (giỏ hàng)
    await CartItem.destroy({
      where: { product_id: productId },
      transaction
    });

    // 2. Xóa Review (đánh giá)
    await Review.destroy({
      where: { product_id: productId },
      transaction
    });

    // 3. Xóa OrderItem (chi tiết đơn hàng) - có thể giữ lại nếu muốn lưu lịch sử
    // Nhưng vì user muốn xóa hoàn toàn, nên xóa luôn
    await OrderItem.destroy({
      where: { product_id: productId },
      transaction
    });

    // 4. ProductImage và ProductVariant sẽ tự động xóa nhờ ON DELETE CASCADE
    // Nhưng để chắc chắn, xóa thủ công trước
    await ProductImage.destroy({
      where: { product_id: productId },
      transaction
    });

    await ProductVariant.destroy({
      where: { product_id: productId },
      transaction
    });

    // 5. Xóa sản phẩm
    await product.destroy({ transaction });

    // Commit transaction
    await transaction.commit();

    // Log action (không làm fail request nếu log fail)
    try {
      const SystemLog = require('../models').SystemLog;
      await SystemLog.create({
        user_id: req.user.id,
        action: 'DELETE',
        table_name: 'products',
        record_id: productId,
        description: `Xóa sản phẩm: ${productName}`,
        ip_address: req.ip
      });
    } catch (logError) {
      // Log lỗi nhưng không làm fail request
      console.error('Failed to create system log:', logError);
    }

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Category,
        as: 'children',
        attributes: ['id', 'name', 'description']
      }],
      where: { parent_id: null },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// Get suppliers
const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { suppliers }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSuppliers
};

