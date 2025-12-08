const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Manager+ routes
router.get('/', authenticate, authorize('manager', 'admin'), userController.getUsers);
router.get('/logs', authenticate, authorize('admin'), userController.getSystemLogs);

// All authenticated users
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);

// Admin only routes
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.put('/:id/role', authenticate, authorize('admin'), userController.updateUserRole);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;

