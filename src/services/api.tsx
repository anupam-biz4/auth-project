import axios from 'axios';

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface VerifyOTPData {
  email: string;
  otp: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

interface CachedItem<T> {
  promise: Promise<T>;
  timestamp: number;
}

/**
 * API Service
 * Centralized service for all backend API calls
 */

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Request cache to prevent duplicate calls
const requestCache = new Map<string, CachedItem<unknown>>();
const CACHE_DURATION = 5000; // 5 seconds

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Helper function to prevent duplicate requests
 * @param {string} key - Unique key for the request
 * @param {Function} requestFn - Function that returns a promise
 */
function cachedRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = requestCache.get(key);

  // Return cached result if still valid
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.promise as Promise<T>;
  }

  // Make new request and cache it
  const promise = requestFn();
  requestCache.set(key, { promise, timestamp: now });

  // Clean up cache after request completes
  promise.finally(() => {
    setTimeout(() => requestCache.delete(key), CACHE_DURATION);
  });

  return promise;
}

/**
 * Auth API Methods
 */
export const authAPI = {
  /**
   * User signup
   * @param {Object} data - {name, email, password}
   */
  signup: async (data: SignupData) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  /**
   * Verify signup OTP
   * @param {Object} data - {email, otp}
   */
  verifySignupOTP: async (data: VerifyOTPData) => {
    const response = await api.post('/auth/verify-signup-otp', data);
    return response.data;
  },

  /**
   * User login
   * @param {Object} data - {email, password}
   */
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  /**
   * Forgot password - send OTP
   * @param {Object} data - {email}
   */
  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with OTP
   * @param {Object} data - {email, otp, newPassword}
   */
  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Get user profile (protected route)
   */
  getProfile: async () => {
    // Use cached request to avoid duplicate fetches within a short window
    return cachedRequest('GET:/auth/profile', async () => {
      const response = await api.get('/auth/profile');
      return response.data;
    });
  },
};

export default api;
