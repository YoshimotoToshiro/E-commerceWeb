const { Supplier, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all suppliers (Manager+)
const getSuppliers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { contact_person: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { suppliers }
    });
  } catch (error) {
    next(error);
  }
};

// Get supplier by ID (Manager+)
const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    res.json({
      success: true,
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// Create supplier (Manager+)
const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      table_name: 'suppliers',
      record_id: supplier.id,
      description: `Tạo nhà cung cấp: ${supplier.name}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nhà cung cấp thành công',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// Update supplier (Manager+)
const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    await supplier.update(req.body);

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'suppliers',
      record_id: supplier.id,
      description: `Cập nhật nhà cung cấp: ${supplier.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Cập nhật nhà cung cấp thành công',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// Delete supplier (Manager+)
const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    // Kiểm tra xem có sản phẩm nào đang sử dụng nhà cung cấp này không
    const { Product } = require('../models');
    const productCount = await Product.count({
      where: { supplier_id: id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa nhà cung cấp này vì có ${productCount} sản phẩm đang sử dụng`
      });
    }

    await supplier.destroy();

    // Log action
    await require('../models').SystemLog.create({
      user_id: req.user.id,
      action: 'DELETE',
      table_name: 'suppliers',
      record_id: id,
      description: `Xóa nhà cung cấp: ${supplier.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Xóa nhà cung cấp thành công'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};

