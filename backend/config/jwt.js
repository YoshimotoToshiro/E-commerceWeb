require('dotenv').config();

module.exports = {
  accessTokenSecret: process.env.JWT_SECRET || 'dev-secret-key',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d'
};

