// Categories API integration for OnlineOffers
import apiClient from './client';

export const categoryApi = {
  // Get all categories
  getCategories: async () => {
    return apiClient.get('/api/categories');
  },

  // Get category by ID
  getCategoryById: async (id) => {
    return apiClient.get(`/api/categories/${id}`);
  },

  // Admin: Create new category
  createCategory: async (categoryData) => {
    return apiClient.post('/api/categories', categoryData);
  },

  // Admin: Update category
  updateCategory: async (id, categoryData) => {
    return apiClient.put(`/api/categories/${id}`, categoryData);
  },

  // Admin: Delete category
  deleteCategory: async (id) => {
    return apiClient.delete(`/api/categories/${id}`);
  },
};

export default categoryApi;
