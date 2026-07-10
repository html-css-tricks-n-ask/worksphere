import { authApi } from '../api/auth.api.js';
import { LoginInput, RegisterFormInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema.js';

export const authService = {
  login: async (data: LoginInput) => {
    const res = await authApi.login(data);
    return res.data; // Return accessToken and user info
  },

  register: async (data: RegisterFormInput) => {
    const res = await authApi.register(data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const res = await authApi.forgotPassword(data);
    return res.data;
  },

  resetPassword: async (token: string, data: ResetPasswordInput) => {
    const res = await authApi.resetPassword(token, data);
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const res = await authApi.verifyEmail(token);
    return res.data;
  },
};
