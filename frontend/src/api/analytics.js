// Analytics API integration for OnlineOffers
import apiClient from './client';

export const analyticsApi = {
  // Get dashboard analytics data
  getDashboardAnalytics: async () => {
    return apiClient.get('/api/analytics/dashboard');
  },
};

export default analyticsApi;
