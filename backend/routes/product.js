const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize, authenticateOptional } = require('../middleware/auth');

// Public routes
router.get('/', authenticateOptional, productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/suppliers', productController.getSuppliers);
router.get('/:id', authenticateOptional, productController.getProductById);

// Protected routes (Manager+)
router.post('/', authenticate, authorize('manager', 'admin'), productController.createProduct);
router.put('/:id', authenticate, authorize('manager', 'admin'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('manager', 'admin'), productController.deleteProduct);

module.exports = router;

