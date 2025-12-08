const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingController');

// Admin only
router.get('/', authenticate, authorize('admin'), getSettings);
router.put('/', authenticate, authorize('admin'), updateSettings);

// Public settings (no auth)
router.get('/public', getPublicSettings);

module.exports = router;


