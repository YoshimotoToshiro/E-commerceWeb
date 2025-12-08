const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const sequelize = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const promotionRoutes = require('./routes/promotion');
const userRoutes = require('./routes/user');
const statisticsRoutes = require('./routes/statistics');
const bannerRoutes = require('./routes/banner');
const settingRoutes = require('./routes/setting');
const supplierRoutes = require('./routes/supplier');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tech Store API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/suppliers', supplierRoutes);

// Error handler (phải đặt cuối cùng)
app.use(errorHandler);

// Database connection với retry logic
async function connectDatabase(maxRetries = 10, retryDelay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${maxRetries} - Database connection failed, retrying in ${retryDelay/1000}s...`);
      if (i === maxRetries - 1) {
        console.error('❌ Unable to connect to database after', maxRetries, 'attempts:', error.message);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Database connection và start server
async function startServer() {
  try {
    // Đợi database sẵn sàng với retry logic
    await connectDatabase();
    
    // Sync models (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: true });
      console.log('📝 Database models ready');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

