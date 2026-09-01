// Click tracking and affiliate redirect API integration
import apiClient from './client';

export const clickApi = {
  // Returns the backend redirect URL for a product
  getRedirectUrl: (productId) => {
    const baseUrl = apiClient.getBaseUrl();
    return `${baseUrl}/api/clicks/redirect/${productId}`;
  },

  // Triggers redirect in new tab or window
  buyNow: (productId) => {
    if (!productId) return;
    const url = clickApi.getRedirectUrl(productId);
    window.open(url, '_blank', 'noopener,noreferrer');
  },
};

export default clickApi;
