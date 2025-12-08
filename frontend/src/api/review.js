import api from './axios';

export const reviewAPI = {
  getProductReviews: (productId, params) =>
    api.get(`/reviews/products/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
};


