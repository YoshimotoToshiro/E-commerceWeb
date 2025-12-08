const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

// User routes
router.post('/', authenticate, authorize('user', 'employee', 'manager', 'admin'), orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/confirm-received', authenticate, authorize('user'), orderController.confirmReceived);

// Employee+ routes
router.put('/:id/status', authenticate, authorize('employee', 'manager', 'admin'), orderController.updateOrderStatus);

module.exports = router;

