import api from './axios';

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  confirmReceived: (id) => api.put(`/orders/${id}/confirm-received`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

