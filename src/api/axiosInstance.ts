import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const safeGetToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Try regular user token first (for authenticated users)
    const userToken = window.localStorage.getItem('token');
    if (userToken) {
      return userToken;
    }

    // Fall back to JWT attempt token (for guest participants)
    const attemptToken = window.localStorage.getItem('attempt_token');
    if (attemptToken) {
      return attemptToken;
    }

    return null;
  } catch (error) {
    console.warn('Unable to read token from localStorage', error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = safeGetToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend server may be slow or not responding');
      console.error('Request URL:', error.config?.url);
      console.error('Full URL:', `${error.config?.baseURL}${error.config?.url}`);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Backend server may not be running');
      console.error('Expected server at:', API_BASE_URL);
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
