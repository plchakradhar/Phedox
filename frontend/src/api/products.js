// Products API integration for OnlineOffers
import apiClient from './client';

export const productApi = {
  // Get active products with optional filters
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.marketplaceId) params.append('marketplaceId', filters.marketplaceId);
    if (filters.minDiscount) params.append('minDiscount', filters.minDiscount);
    if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
    return apiClient.get(endpoint);
  },

  // Get single product details by ID
  getProductById: async (id) => {
    return apiClient.get(`/api/products/${id}`);
  },

  // Admin: Get all products (active)
  getAllAdminProducts: async () => {
    return apiClient.get('/api/admin/products');
  },

  // Admin: Create new product manually
  createProduct: async (productData) => {
    return apiClient.post('/api/products', productData);
  },

  // Admin: Update product
  updateProduct: async (id, productData) => {
    return apiClient.put(`/api/products/${id}`, productData);
  },

  // Admin: Deactivate product
  deactivateProduct: async (id) => {
    return apiClient.delete(`/api/products/${id}`);
  },
};

export default productApi;
