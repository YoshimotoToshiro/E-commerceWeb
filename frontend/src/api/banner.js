import api from './axios';

export const bannerAPI = {
  getActiveBanners: () => api.get('/banners/active'),
  getBanners: () => api.get('/banners'),
  getBannerById: (id) => api.get(`/banners/${id}`),
  createBanner: (data) => api.post('/banners', data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
};

