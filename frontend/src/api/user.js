import api from './axios';

export const userAPI = {
  // Manager+ can list users
  getUsers: (params = {}) => api.get('/users', { params }),
  // Admin create user
  createUser: (data) => api.post('/users', data),
  // Admin or manager update user details/status
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  // Admin only: update role
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  // Admin only: delete (soft)
  deleteUser: (id) => api.delete(`/users/${id}`),
  // Admin: báo cáo hoạt động người dùng
  getSystemLogs: (params = {}) => api.get('/users/logs', { params }),
};


