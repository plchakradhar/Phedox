// Marketplaces API integration for OnlineOffers
import apiClient from './client';

export const marketplaceApi = {
  // Get all marketplaces
  getMarketplaces: async () => {
    return apiClient.get('/api/marketplaces');
  },

  // Get marketplace by ID
  getMarketplaceById: async (id) => {
    return apiClient.get(`/api/marketplaces/${id}`);
  },

  // Admin: Create marketplace
  createMarketplace: async (marketplaceData) => {
    return apiClient.post('/api/marketplaces', marketplaceData);
  },

  // Admin: Update marketplace
  updateMarketplace: async (id, marketplaceData) => {
    return apiClient.put(`/api/marketplaces/${id}`, marketplaceData);
  },

  // Admin: Delete marketplace
  deleteMarketplace: async (id) => {
    return apiClient.delete(`/api/marketplaces/${id}`);
  },
};

export default marketplaceApi;
