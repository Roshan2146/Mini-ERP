import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('erp_crm_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - redirect to login if not already there
      if (status === 401) {
        localStorage.removeItem('erp_crm_token');
        localStorage.removeItem('erp_crm_user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      const errorMessage = data?.message || error.message || 'An error occurred';
      return Promise.reject({
        status,
        message: errorMessage,
        errors: data?.errors || [],
        raw: data,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Unable to connect to server. Please check your network or backend connection.',
        errors: [],
      });
    }

    return Promise.reject({
      status: -1,
      message: error.message,
      errors: [],
    });
  }
);

export default api;
