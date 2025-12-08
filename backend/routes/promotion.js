const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', promotionController.getPromotions);
router.post('/validate', promotionController.validatePromotion);

// Manager+ routes
router.post('/', authenticate, authorize('manager', 'admin'), promotionController.createPromotion);
router.put('/:id', authenticate, authorize('manager', 'admin'), promotionController.updatePromotion);
router.delete('/:id', authenticate, authorize('manager', 'admin'), promotionController.deletePromotion);

module.exports = router;

