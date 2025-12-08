const { Review, Product, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

// Get reviews by product
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Review.findAndCountAll({
      where: {
        product_id: productId,
        status: 'approved'
      },
      include: [{
        model: require('../models').User,
        as: 'user',
        attributes: ['id', 'username', 'full_name']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        reviews: rows,
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

// Create review (User, đã mua sản phẩm)
const createReview = async (req, res, next) => {
  try {
    const { product_id, order_id, rating, comment } = req.body;

    // Yêu cầu order_id bắt buộc để đảm bảo chỉ khách hàng đã mua mới được đánh giá
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Bạn cần mua và nhận được sản phẩm này trước khi đánh giá'
      });
    }

    // Kiểm tra user đã mua sản phẩm này chưa
    const order = await Order.findOne({
      where: {
        id: order_id,
        user_id: req.user.id,
        status: 'delivered'
      },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { product_id }
      }]
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao'
      });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      where: {
        product_id,
        user_id: req.user.id,
        order_id: order_id || null
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này'
      });
    }

    const review = await Review.create({
      product_id,
      user_id: req.user.id,
      order_id: order_id || null,
      rating,
      comment,
      status: 'approved'
    });

    // Load user info for response
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{
        model: require('../models').User,
        as: 'user',
        attributes: ['id', 'username', 'full_name']
      }]
    });

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      table_name: 'reviews',
      record_id: review.id,
      description: `Tạo đánh giá cho sản phẩm ID: ${product_id}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Đánh giá đã được gửi thành công',
      data: { review: reviewWithUser }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview
};

