const { Order, Product, ProductVariant, Expense, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get revenue statistics
const getRevenue = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let dateFormat, groupBy, startDate;

    const now = new Date();
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(order_date)';
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'week':
        dateFormat = '%Y-%u';
        groupBy = 'YEAR(order_date), WEEK(order_date)';
        startDate = new Date(now.getFullYear(), now.getMonth() - 6);
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupBy = 'YEAR(order_date), MONTH(order_date)';
        startDate = new Date(now.getFullYear(), now.getMonth() - 12);
        break;
      case 'year':
        dateFormat = '%Y';
        groupBy = 'YEAR(order_date)';
        startDate = new Date(now.getFullYear() - 5, 0, 1);
        break;
      default:
        dateFormat = '%Y-%m';
        groupBy = 'YEAR(order_date), MONTH(order_date)';
        startDate = new Date(now.getFullYear(), now.getMonth() - 12);
    }

    const revenue = await Order.findAll({
      where: {
        status: { [Op.ne]: 'cancelled' },
        order_date: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('order_date'), dateFormat), 'period'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.literal(groupBy)],
      order: [[sequelize.literal('period'), 'ASC']],
      raw: true
    });

    // Tính tổng
    const totalRevenue = revenue.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalOrders = revenue.reduce((sum, item) => sum + parseInt(item.count || 0), 0);

    res.json({
      success: true,
      data: {
        period,
        revenue: revenue.map(item => ({
          period: item.period,
          total: parseFloat(item.total || 0),
          count: parseInt(item.count || 0)
        })),
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get order statistics
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    const totalOrders = stats.reduce((sum, item) => sum + parseInt(item.count || 0), 0);
    const totalRevenue = stats.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

    res.json({
      success: true,
      data: {
        byStatus: stats.map(item => ({
          status: item.status,
          count: parseInt(item.count || 0),
          total: parseFloat(item.total || 0)
        })),
        summary: {
          totalOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get top selling products
const getTopSellingProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.brand,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      INNER JOIN products p ON oi.product_id = p.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.brand
      ORDER BY total_sold DESC
      LIMIT :limit
    `, {
      replacements: { limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        products: topProducts.map(item => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          totalSold: parseInt(item.total_sold || 0),
          totalRevenue: parseFloat(item.total_revenue || 0)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get low stock products
const getLowStockProducts = async (req, res, next) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStock = await ProductVariant.findAll({
      where: {
        stock_quantity: { [Op.lte]: parseInt(threshold) },
        status: 'active'
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'brand']
      }],
      order: [['stock_quantity', 'ASC']],
      limit: 50
    });

    res.json({
      success: true,
      data: {
        products: lowStock.map(item => ({
          id: item.id,
          variantName: item.variant_name,
          stockQuantity: item.stock_quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand
          }
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard summary (Manager+)
const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Doanh thu hôm nay
    const todayRevenue = await Order.sum('final_amount', {
      where: {
        order_date: { [Op.gte]: today },
        status: { [Op.ne]: 'cancelled' }
      }
    }) || 0;

    // Đơn hàng mới hôm nay
    const todayOrders = await Order.count({
      where: {
        order_date: { [Op.gte]: today }
      }
    });

    // Đơn hàng đang chờ xử lý
    const pendingOrders = await Order.count({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });

    // Sản phẩm sắp hết hàng
    const lowStockCount = await ProductVariant.count({
      where: {
        stock_quantity: { [Op.lte]: 10 },
        status: 'active'
      }
    });

    res.json({
      success: true,
      data: {
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        todayOrders,
        pendingOrders,
        lowStockCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenue,
  getOrderStats,
  getTopSellingProducts,
  getLowStockProducts,
  getDashboardSummary
};

