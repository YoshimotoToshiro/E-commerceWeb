const { User, SystemLog } = require('../models');
const { Op } = require('sequelize');

// Get all users (Manager+)
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { full_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin create user
const createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      full_name,
      phone,
      address,
      role = 'user',
      status = 'active'
    } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const validRoles = ['user', 'employee', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ'
      });
    }

    const validStatuses = ['active', 'inactive', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username hoặc email đã tồn tại'
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      full_name,
      phone,
      address,
      role,
      status
    });

    const userData = newUser.toJSON();
    delete userData.password;

    await SystemLog.create({
      user_id: req.user.id,
      action: 'CREATE',
      table_name: 'users',
      record_id: newUser.id,
      description: `Tạo user mới: ${username}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: { user: userData }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // User chỉ xem profile của mình, Manager+ xem tất cả
    if (req.user.role === 'user' && parseInt(id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // User chỉ sửa profile của mình
    if (req.user.role === 'user' && parseInt(id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho user thay đổi role
    const updateData = { ...req.body };
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      delete updateData.role;
      delete updateData.status;
    }

    await user.update(updateData);

    // Log action
    await SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'users',
      record_id: user.id,
      description: `Cập nhật user: ${user.username}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'employee', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const oldRole = user.role;
    await user.update({ role });

    // Log action
    await SystemLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'users',
      record_id: user.id,
      description: `Thay đổi role user ${user.username}: ${oldRole} → ${role}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Cập nhật role thành công',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chính mình'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Soft delete
    await user.update({ status: 'inactive' });

    // Log action
    await SystemLog.create({
      user_id: req.user.id,
      action: 'DELETE',
      table_name: 'users',
      record_id: user.id,
      description: `Xóa user: ${user.username}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Get system logs (Admin only)
const getSystemLogs = async (req, res, next) => {
  try {
    const { user_id, action, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (user_id) {
      where.user_id = user_id;
    }

    if (action) {
      where.action = action;
    }

    const { count, rows } = await SystemLog.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'full_name'],
        required: false
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  getSystemLogs
};

