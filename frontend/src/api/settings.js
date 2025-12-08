import api from './axios';

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  getPublic: () => api.get('/settings/public'),
};


