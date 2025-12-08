const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/products/:productId', reviewController.getProductReviews);

// User routes
router.post('/', authenticate, authorize('user', 'employee', 'manager', 'admin'), reviewController.createReview);

module.exports = router;

