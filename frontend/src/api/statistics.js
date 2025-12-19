import api from './axios';

export const statisticsAPI = {
  getRevenue: (params) => api.get('/statistics/revenue', { params }),
  getOrderStats: () => api.get('/statistics/orders'),
  getTopSellingProducts: (params) => api.get('/statistics/products/top-selling', { params }),
  getLowStockProducts: (params) => api.get('/statistics/products/low-stock', { params }),
  getDashboardSummary: () => api.get('/statistics/dashboard'),
  getRevenueByEmployee: () => api.get('/statistics/revenue/by-employee'),
  getHighlightEmployees: () => api.get('/statistics/employees/highlight'),
};

