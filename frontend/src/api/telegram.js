// Telegram API integration for OnlineOffers
import apiClient from './client';

export const telegramApi = {
  // Get all Telegram posts
  getAllPosts: async () => {
    return apiClient.get('/api/telegram/posts');
  },

  // Get single post by ID
  getPostById: async (id) => {
    return apiClient.get(`/api/telegram/posts/${id}`);
  },

  // Get posts filtered by status (RECEIVED, PROCESSING, PROCESSED, FAILED)
  getPostsByStatus: async (status) => {
    if (!status || status === 'ALL') {
      return apiClient.get('/api/telegram/posts');
    }
    return apiClient.get(`/api/telegram/posts/status/${status}`);
  },

  // Ingest telegram post (for testing or simulation)
  receivePost: async (postData) => {
    return apiClient.post('/api/telegram/posts', postData);
  },

  // Admin: Manually trigger processing for a telegram post
  processPostManually: async (postId) => {
    return apiClient.post(`/api/admin/telegram/process/${postId}`, {});
  },
};

export default telegramApi;
