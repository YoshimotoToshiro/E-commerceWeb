const SystemSetting = require('../models/SystemSetting');

// GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    const rows = await SystemSetting.findAll();
    const data = rows.reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const entries = Object.entries(payload);
    for (const [key, value] of entries) {
      await SystemSetting.upsert({ key, value: String(value) });
    }
    const rows = await SystemSetting.findAll();
    const data = rows.reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});
    res.json({ success: true, message: 'Cập nhật cấu hình thành công', data });
  } catch (error) {
    next(error);
  }
};

// GET /api/settings/public - public subset for frontend (no auth)
const getPublicSettings = async (req, res, next) => {
  try {
    const keys = ['siteName', 'supportEmail', 'phone', 'facebook', 'instagram', 'twitter'];
    const rows = await SystemSetting.findAll({ where: { key: keys } });
    const data = rows.reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings, getPublicSettings };


