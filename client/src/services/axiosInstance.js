 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import axios, { } from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1',
  withCredentials: true,
  timeout: 60000, // 60s — handles Render.com cold-starts (free tier spins down after inactivity)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization Header
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Expiration and Session Failures
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detect if we hit token expiration (401) and have not retried yet
    if (_optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.status]) === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // In Phase 2: Call the actual Refresh Token endpoint.
        // For Phase 1: Gracefully log out the user and trigger re-auth.
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
