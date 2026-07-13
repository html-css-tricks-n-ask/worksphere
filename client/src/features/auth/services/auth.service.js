import { authApi } from '../api/auth.api';


export const authService = {
  login: async (data) => {
    const res = await authApi.login(data);
    return res.data; // Return accessToken and user info
  },

  register: async (data) => {
    const res = await authApi.register(data);
    return res.data;
  },

  forgotPassword: async (data) => {
    const res = await authApi.forgotPassword(data);
    return res.data;
  },

  resetPassword: async (token, data) => {
    const res = await authApi.resetPassword(token, data);
    return res.data;
  },

  verifyEmail: async (token) => {
    const res = await authApi.verifyEmail(token);
    return res.data;
  },
};
