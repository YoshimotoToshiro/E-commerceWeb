const { Promotion, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all promotions
const getPromotions = async (req, res, next) => {
  try {
    const { active } = req.query;
    const where = {};

    if (active === 'true') {
      where.start_date = { [Op.lte]: new Date() };
      where.end_date = { [Op.gte]: new Date() };
      where[Op.or] = [
        { usage_limit: null },
        sequelize.literal('used_count < usage_limit')
      ];
    }

    const promotions = await Promotion.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { promotions }
    });
  } catch (error) {
    next(error);
  }
};

// Validate promotion code
const validatePromotion = async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;

    const promotion = await Promotion.findOne({
      where: {
        code,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
        [Op.or]: [
          { usage_limit: null },
          sequelize.literal('used_count < usage_limit')
        ]
      }
    });

    if (!promotion) {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn'
      });
    }

    if (orderValue < parseFloat(promotion.min_order_value)) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${promotion.min_order_value.toLocaleString('vi-VN')} VNĐ`
      });
    }

    let discountAmount = 0;
    if (promotion.discount_type === 'percentage') {
      discountAmount = orderValue * (parseFloat(promotion.discount_value) / 100);
    } else {
      discountAmount = parseFloat(promotion.discount_value);
    }
    discountAmount = Math.min(discountAmount, orderValue);

    res.json({
      success: true,
      data: {
        promotion: {
          id: promotion.id,
          code: promotion.code,
          name: promotion.name,
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
          discount_amount: parseFloat(discountAmount.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create promotion (Manager+)
const createPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.create(req.body);

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      table_name: 'promotions',
      record_id: promotion.id,
      description: `Tạo khuyến mãi: ${promotion.code}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tạo khuyến mãi thành công',
      data: { promotion }
    });
  } catch (error) {
    next(error);
  }
};

// Update promotion (Manager+)
const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByPk(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mãi'
      });
    }

    await promotion.update(req.body);

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'promotions',
      record_id: promotion.id,
      description: `Cập nhật khuyến mãi: ${promotion.code}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Cập nhật khuyến mãi thành công',
      data: { promotion }
    });
  } catch (error) {
    next(error);
  }
};

// Delete promotion (Manager+)
const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByPk(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mãi'
      });
    }

    await promotion.destroy();

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'DELETE',
      table_name: 'promotions',
      record_id: id,
      description: `Xóa khuyến mãi: ${promotion.code}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Xóa khuyến mãi thành công'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPromotions,
  validatePromotion,
  createPromotion,
  updatePromotion,
  deletePromotion
};

