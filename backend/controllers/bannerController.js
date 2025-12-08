const { Banner, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get active banners (Public)
const getActiveBanners = async (req, res, next) => {
  try {
    const now = new Date();
    const banners = await Banner.findAll({
      where: {
        is_active: true,
        [Op.and]: [
          {
            [Op.or]: [
              { start_date: null },
              { start_date: { [Op.lte]: now } }
            ]
          },
          {
            [Op.or]: [
              { end_date: null },
              { end_date: { [Op.gte]: now } }
            ]
          }
        ]
      },
      order: [['position', 'ASC'], ['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: { banners }
    });
  } catch (error) {
    next(error);
  }
};

// Get all banners (Manager+)
const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
      order: [['position', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { banners }
    });
  } catch (error) {
    next(error);
  }
};

// Get banner by ID (Manager+)
const getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    res.json({
      success: true,
      data: { banner }
    });
  } catch (error) {
    next(error);
  }
};

// Create banner (Manager+)
const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      table_name: 'banners',
      record_id: banner.id,
      description: `Tạo banner: ${banner.title}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tạo banner thành công',
      data: { banner }
    });
  } catch (error) {
    next(error);
  }
};

// Update banner (Manager+)
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    await banner.update(req.body);

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'banners',
      record_id: banner.id,
      description: `Cập nhật banner: ${banner.title}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Cập nhật banner thành công',
      data: { banner }
    });
  } catch (error) {
    next(error);
  }
};

// Delete banner (Manager+)
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    await banner.destroy();

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'DELETE',
      table_name: 'banners',
      record_id: id,
      description: `Xóa banner: ${banner.title}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Xóa banner thành công'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveBanners,
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
};

