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
        // Mở rộng lên 365 ngày (1 năm) để đảm bảo lấy được đủ dữ liệu
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365);
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

    // Sử dụng raw query để tránh vấn đề với Sequelize grouping
    // DATE_FORMAT không thể dùng placeholder, phải dùng template literal
    const startDateStr = startDate.toISOString().split('T')[0];
    let query;

    // Đảm bảo startDateStr là string hợp lệ
    const safeStartDate = startDateStr || new Date().toISOString().split('T')[0];
    
    if (period === 'day') {
      // Query đơn giản: lấy tất cả đơn hàng không bị hủy, nhóm theo ngày, tổng hợp
      query = `
        SELECT 
          DATE(order_date) as period,
          SUM(final_amount) as total,
          COUNT(*) as count
        FROM orders
        WHERE status != 'cancelled' 
          AND order_date IS NOT NULL
        GROUP BY DATE(order_date)
        ORDER BY period ASC
      `;
    } else if (period === 'week') {
      query = `
        SELECT 
          DATE_FORMAT(order_date, '${dateFormat}') as period,
          COALESCE(SUM(CAST(final_amount AS DECIMAL(12,2))), 0) as total,
          COUNT(id) as count
        FROM orders
        WHERE status != 'cancelled' 
          AND order_date IS NOT NULL
          AND order_date >= '${safeStartDate}'
        GROUP BY YEAR(order_date), WEEK(order_date, 1)
        ORDER BY period ASC
      `;
    } else if (period === 'month') {
      query = `
        SELECT 
          DATE_FORMAT(order_date, '${dateFormat}') as period,
          COALESCE(SUM(CAST(final_amount AS DECIMAL(12,2))), 0) as total,
          COUNT(id) as count
        FROM orders
        WHERE status != 'cancelled' 
          AND order_date IS NOT NULL
          AND order_date >= '${safeStartDate}'
        GROUP BY YEAR(order_date), MONTH(order_date)
        ORDER BY period ASC
      `;
    } else { // year
      query = `
        SELECT 
          DATE_FORMAT(order_date, '${dateFormat}') as period,
          COALESCE(SUM(CAST(final_amount AS DECIMAL(12,2))), 0) as total,
          COUNT(id) as count
        FROM orders
        WHERE status != 'cancelled' 
          AND order_date IS NOT NULL
          AND order_date >= '${safeStartDate}'
        GROUP BY YEAR(order_date)
        ORDER BY period ASC
      `;
    }

    // Log query để debug (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Revenue query:', query);
      console.log('Period:', period, 'StartDate:', startDateStr, 'StartDate object:', startDate);
      console.log('Current date:', now);
    }

    let revenue;
    try {
      revenue = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
      });
    } catch (queryError) {
      console.error('SQL Query Error:', queryError);
      console.error('Query that failed:', query);
      // Trả về mảng rỗng thay vì throw error để frontend không bị crash
      revenue = [];
    }

    // Đảm bảo revenue là mảng
    const revenueArray = Array.isArray(revenue) ? revenue : [];
    
    // Format lại period cho period='day' để đảm bảo format YYYY-MM-DD
    const formattedRevenueArray = revenueArray.map(item => {
      if (period === 'day' && item.period) {
        // Nếu period là DATE object hoặc string, format lại thành YYYY-MM-DD
        const date = new Date(item.period);
        if (!isNaN(date.getTime())) {
          return {
            ...item,
            period: date.toISOString().split('T')[0]
          };
        }
      }
      return item;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Revenue result count:', formattedRevenueArray.length);
      console.log('Revenue raw result (first 3):', formattedRevenueArray.slice(0, 3));
      if (period === 'day') {
        console.log('Daily revenue - first 5 items:', formattedRevenueArray.slice(0, 5));
        console.log('Daily revenue - last 5 items:', formattedRevenueArray.slice(-5));
      }
    }

    // Nếu không có dữ liệu, kiểm tra xem có đơn hàng nào không
    if (revenueArray.length === 0) {
      const totalOrdersCount = await Order.count({
        where: {
          status: { [Op.ne]: 'cancelled' }
        }
      });
      
      const allOrdersCount = await Order.count();
      const cancelledOrdersCount = await Order.count({
        where: { status: 'cancelled' }
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Total non-cancelled orders in database:', totalOrdersCount);
        console.log('Total orders:', allOrdersCount);
        console.log('Cancelled orders:', cancelledOrdersCount);
        console.log('Period selected:', period, 'Start date:', startDateStr);
      }
      
      // Nếu có đơn hàng nhưng không có trong khoảng thời gian, vẫn trả về mảng rỗng
      // Frontend sẽ hiển thị "Chưa có dữ liệu"
    }

    // Tính tổng
    const totalRevenue = formattedRevenueArray.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalOrders = formattedRevenueArray.reduce((sum, item) => sum + parseInt(item.count || 0), 0);

    res.json({
      success: true,
      data: {
        period,
        revenue: formattedRevenueArray.map(item => ({
          period: item.period || '',
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
    console.error('Error in getRevenue:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu doanh thu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const statsArray = Array.isArray(stats) ? stats : [];
    const totalOrders = statsArray.reduce((sum, item) => sum + parseInt(item.count || 0), 0);
    const totalRevenue = statsArray.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

    res.json({
      success: true,
      data: {
        byStatus: statsArray.map(item => ({
          status: item.status || 'unknown',
          count: parseInt(item.count || 0),
          total: parseFloat(item.total || 0)
        })),
        summary: {
          totalOrders,
          totalRevenue: parseFloat((totalRevenue || 0).toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const productsArray = Array.isArray(topProducts) ? topProducts : [];
    res.json({
      success: true,
      data: {
        products: productsArray.map(item => ({
          id: item.id,
          name: item.name || 'Unknown',
          brand: item.brand || '',
          totalSold: parseInt(item.total_sold || 0),
          totalRevenue: parseFloat(item.total_revenue || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Error in getTopSellingProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm bán chạy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const lowStockArray = Array.isArray(lowStock) ? lowStock : [];
    res.json({
      success: true,
      data: {
        products: lowStockArray.map(item => ({
          id: item.id,
          variantName: item.variant_name || '',
          stockQuantity: item.stock_quantity || 0,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name || 'Unknown',
            brand: item.product.brand || ''
          } : null
        })).filter(item => item.product !== null)
      }
    });
  } catch (error) {
    console.error('Error in getLowStockProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm sắp hết hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
        todayRevenue: parseFloat((todayRevenue || 0).toFixed(2)),
        todayOrders: todayOrders || 0,
        pendingOrders: pendingOrders || 0,
        lowStockCount: lowStockCount || 0
      }
    });
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get revenue by employee
const getRevenueByEmployee = async (req, res, next) => {
  try {
    const revenueByEmployee = await sequelize.query(`
      SELECT 
        u.id,
        u.full_name as name,
        u.username,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.final_amount), 0) as total_revenue
      FROM orders o
      INNER JOIN users u ON o.employee_id = u.id
      WHERE o.status != 'cancelled'
        AND u.role = 'employee'
        AND o.employee_id IS NOT NULL
      GROUP BY u.id, u.full_name, u.username
      ORDER BY total_revenue DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    const employeesArray = Array.isArray(revenueByEmployee) ? revenueByEmployee : [];
    
    // Log để debug
    if (process.env.NODE_ENV === 'development') {
      console.log('Revenue by employee result:', employeesArray.length, 'employees');
    }
    
    res.json({
      success: true,
      data: {
        employees: employeesArray.map(item => {
          // Xử lý tên - nếu full_name là null hoặc rỗng, dùng username
          let displayName = item.name || item.username || 'Unknown';
          // Nếu tên quá dài, rút ngắn
          if (displayName.length > 20) {
            displayName = displayName.substring(0, 17) + '...';
          }
          return {
            id: item.id,
            name: displayName,
            orderCount: parseInt(item.order_count || 0),
            revenue: parseFloat(item.total_revenue || 0)
          };
        })
      }
    });
  } catch (error) {
    console.error('Error in getRevenueByEmployee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu doanh thu theo nhân viên',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get highlight employees (top performers)
const getHighlightEmployees = async (req, res, next) => {
  try {
    const employees = await sequelize.query(`
      SELECT 
        u.id,
        u.full_name as name,
        u.username,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.final_amount), 0) as total_revenue
      FROM orders o
      INNER JOIN users u ON o.employee_id = u.id
      WHERE o.status != 'cancelled'
        AND u.role = 'employee'
        AND o.employee_id IS NOT NULL
        AND o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id, u.full_name, u.username
      ORDER BY total_revenue DESC, order_count DESC
      LIMIT 5
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    const employeesArray = Array.isArray(employees) ? employees : [];
    res.json({
      success: true,
      data: {
        employees: employeesArray.map(item => ({
          id: item.id,
          name: item.name || item.username || 'Unknown',
          orderCount: parseInt(item.order_count || 0),
          revenue: parseFloat(item.total_revenue || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Error in getHighlightEmployees:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu nhân viên nổi bật',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRevenue,
  getOrderStats,
  getTopSellingProducts,
  getLowStockProducts,
  getDashboardSummary,
  getRevenueByEmployee,
  getHighlightEmployees
};

