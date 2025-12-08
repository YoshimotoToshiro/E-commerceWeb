const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Tất cả routes đều cần Manager+
router.use(authenticate);
router.use(authorize('manager', 'admin'));

router.get('/revenue', statisticsController.getRevenue);
router.get('/orders', statisticsController.getOrderStats);
router.get('/products/top-selling', statisticsController.getTopSellingProducts);
router.get('/products/low-stock', statisticsController.getLowStockProducts);
router.get('/dashboard', statisticsController.getDashboardSummary);

module.exports = router;

