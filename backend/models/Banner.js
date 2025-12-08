const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  button_text: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Xem sản phẩm'
  },
  button_link: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '/products'
  },
  background_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL của hình ảnh nền'
  },
  background_color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '#1E40AF',
    comment: 'Màu nền (hex code)'
  },
  text_color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '#FFFFFF',
    comment: 'Màu chữ (hex code)'
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Vị trí hiển thị (1 = đầu trang)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ngày bắt đầu hiển thị'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ngày kết thúc hiển thị'
  }
}, {
  tableName: 'banners',
  timestamps: true
});

module.exports = Banner;

