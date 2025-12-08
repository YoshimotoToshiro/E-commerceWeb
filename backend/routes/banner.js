const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/active', bannerController.getActiveBanners);

// Manager+ routes
router.get('/', authenticate, authorize('manager', 'admin'), bannerController.getBanners);
router.get('/:id', authenticate, authorize('manager', 'admin'), bannerController.getBannerById);
router.post('/', authenticate, authorize('manager', 'admin'), bannerController.createBanner);
router.put('/:id', authenticate, authorize('manager', 'admin'), bannerController.updateBanner);
router.delete('/:id', authenticate, authorize('manager', 'admin'), bannerController.deleteBanner);

module.exports = router;

