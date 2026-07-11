import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../redux/store.js';
import { logout } from '../redux/slices/authSlice.js';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization Header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[AXIOS INTERCEPTOR] Request starting. URL: [${config.url}], Method: [${config.method?.toUpperCase()}], baseURL: [${config.baseURL}]`);
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[AXIOS INTERCEPTOR] Attached auth token to header.`);
    }
    return config;
  },
  (error) => {
    console.error(`[AXIOS INTERCEPTOR] Request interceptor error:`, error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Expiration and Session Failures
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[AXIOS INTERCEPTOR] Response received. URL: [${response.config.url}], Status: [${response.status}]`);
    return response;
  },
  async (error) => {
    console.error(`[AXIOS INTERCEPTOR] Response error occurred. URL: [${error.config?.url}], Status: [${error.response?.status}], Message: [${error.message}], responseDetails:`, error.response?.data || 'No response details');
    const originalRequest = error.config;

    // Detect if we hit token expiration (401) and have not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log(`[AXIOS INTERCEPTOR] Token expired (401). Logging out...`);
      originalRequest._retry = true;

      try {
        store.dispatch(logout());
        return Promise.reject(error);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
