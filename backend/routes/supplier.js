const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');

// Manager+ routes
router.get('/', authenticate, authorize('manager', 'admin'), supplierController.getSuppliers);
router.get('/:id', authenticate, authorize('manager', 'admin'), supplierController.getSupplierById);
router.post('/', authenticate, authorize('manager', 'admin'), supplierController.createSupplier);
router.put('/:id', authenticate, authorize('manager', 'admin'), supplierController.updateSupplier);
router.delete('/:id', authenticate, authorize('manager', 'admin'), supplierController.deleteSupplier);

module.exports = router;

