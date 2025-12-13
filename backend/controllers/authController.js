const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User, SystemLog } = require('../models');

// Tạo tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    jwtConfig.accessTokenSecret,
    { expiresIn: jwtConfig.accessTokenExpiry }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    jwtConfig.refreshTokenSecret,
    { expiresIn: jwtConfig.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};

// Register
const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone, address } = req.body;

    // Kiểm tra user đã tồn tại
    const { Op } = require('sequelize');
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc username đã tồn tại'
      });
    }

    // Tạo user mới
    const user = await User.create({
      username,
      email,
      password,
      full_name,
      phone,
      address,
      role: 'user'
    });

    // Log action
    await SystemLog.create({
      user_id: user.id,
      action: 'REGISTER',
      description: `User ${username} đăng ký tài khoản`,
      ip_address: req.ip
    });

    // Tạo tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set refresh token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không đúng'
      });
    }

    // Kiểm tra status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không đúng'
      });
    }

    // Tạo tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set refresh token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Log action (không block nếu có lỗi)
    try {
      await SystemLog.create({
        user_id: user.id,
        action: 'LOGIN',
        description: `User ${user.username} đăng nhập`,
        ip_address: req.ip
      });
    } catch (logError) {
      console.error('Error creating login log:', logError);
      // Không throw error, chỉ log để không ảnh hưởng đến quá trình login
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          address: user.address
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Không có refresh token'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret);

    // Kiểm tra user
    const user = await User.findByPk(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không hợp lệ'
      });
    }

    // Tạo access token mới
    const accessToken = jwt.sign(
      { userId: user.id },
      jwtConfig.accessTokenSecret,
      { expiresIn: jwtConfig.accessTokenExpiry }
    );

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    // Log action
    if (req.user) {
      await SystemLog.create({
        user_id: req.user.id,
        action: 'LOGOUT',
        description: `User ${req.user.username} đăng xuất`,
        ip_address: req.ip
      });
    }

    // Xóa refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Cập nhật mật khẩu mới
    await user.update({ password: newPassword });

    // Log action
    try {
      await SystemLog.create({
        user_id: user.id,
        action: 'CHANGE_PASSWORD',
        description: `User ${user.username} đổi mật khẩu`,
        ip_address: req.ip
      });
    } catch (logError) {
      console.error('Error creating change password log:', logError);
    }

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword
};

