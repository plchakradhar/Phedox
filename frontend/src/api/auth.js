// Admin Authentication API integration
import apiClient from './client';

export const authApi = {
  login: async (username, password) => {
    return apiClient.post('/api/admin/auth/login', { username, password });
  },
};

export default authApi;
