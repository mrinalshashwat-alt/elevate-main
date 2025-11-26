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
    return window.localStorage.getItem('token');
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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
