/**
 * Candidate/Assessment Axios Instance
 *
 * Separate instance for guest participants taking assessments.
 * Uses JWT attempt tokens only - completely isolated from admin auth.
 *
 * Industry Pattern: HackerRank, CodeSignal use separate domains/instances
 * for candidate experience to ensure security isolation.
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const candidateAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s for video uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get attempt token from localStorage
 * ONLY checks attempt_token - never falls back to admin token
 */
const getAttemptToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem('attempt_token');
  } catch (error) {
    console.error('Failed to read attempt_token from localStorage', error);
    return null;
  }
};

/**
 * Request interceptor - adds attempt token to all requests
 */
candidateAxios.interceptors.request.use(
  (config) => {
    const token = getAttemptToken();

    if (!token) {
      console.warn('No attempt token found - request will fail authentication');
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handles errors and token expiration
 */
candidateAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend server may be slow');
      console.error('Request URL:', error.config?.url);
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Backend server may not be running');
      console.error('Expected server at:', API_BASE_URL);
    }

    // Handle 401 - Assessment expired or invalid token
    if (error.response?.status === 401) {
      console.error('Assessment authentication failed or expired');

      if (typeof window !== 'undefined') {
        // Clear attempt token
        window.localStorage.removeItem('attempt_token');

        // Redirect to assessment expired page
        window.location.href = '/user/assessment-expired';
      }
    }

    return Promise.reject(error);
  }
);

export default candidateAxios;
