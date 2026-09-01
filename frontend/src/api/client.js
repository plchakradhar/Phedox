// Central API Client for OnlineOffers Backend

const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getAuthHeader = () => {
  try {
    const token = localStorage.getItem('phedox_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    console.error('Failed to read auth token from localStorage', e);
  }
  return {};
};

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  // If body is FormData, delete Content-Type to let browser set it with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Handle unauthorized or forbidden
    if (response.status === 401 || response.status === 403) {
      // Clear token if expired or invalid
      try {
        localStorage.removeItem('phedox_token');
        localStorage.removeItem('phedox_user');
        localStorage.removeItem('onlineoffers_token');
        localStorage.removeItem('onlineoffers_user');
      } catch {}
    }

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        `Request failed with status ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or parse error
    throw new ApiError(
      error.message || 'Network connection error. Please check your connection.',
      0,
      null
    );
  }
}

export const apiClient = {
  get: (endpoint, headers = {}) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers = {}) =>
    request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  put: (endpoint, body, headers = {}) =>
    request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  delete: (endpoint, headers = {}) => request(endpoint, { method: 'DELETE', headers }),
  getBaseUrl: () => BASE_URL,
};

export default apiClient;
