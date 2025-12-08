const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User } = require('../models');

// Middleware xác thực JWT
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header hoặc cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token xác thực' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);
    
    // Lấy user từ database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'Người dùng không hợp lệ hoặc đã bị khóa' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ' 
    });
  }
};

// Middleware kiểm tra role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Chưa xác thực' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền truy cập' 
      });
    }

    next();
  };
};

// Middleware xác thực tùy chọn: nếu có token thì set req.user, nếu không thì bỏ qua
const authenticateOptional = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (user && user.status === 'active') {
      req.user = user;
    }
    // Dù không có user hợp lệ cũng cho qua như public
    return next();
  } catch (_err) {
    // Bất kỳ lỗi nào cũng coi như public request
    return next();
  }
};

module.exports = { authenticate, authorize, authenticateOptional };

