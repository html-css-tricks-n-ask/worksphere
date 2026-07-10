import { axiosInstance } from '../../../services/axiosInstance.js';
import { LoginInput, RegisterFormInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema.js';

export const authApi = {
  login: async (data: LoginInput) => {
    const response = await axiosInstance.post('/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  register: async (data: RegisterFormInput) => {
    const response = await axiosInstance.post('/auth/register', {
      company: {
        name: data.companyName,
        email: data.companyEmail,
        phone: data.companyPhone,
        website: data.website,
        companySize: data.companySize,
      },
      admin: {
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        email: data.adminEmail,
        password: data.password,
      },
    });
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email: data.email,
    });
    return response.data;
  },

  resetPassword: async (token: string, data: ResetPasswordInput) => {
    const response = await axiosInstance.post('/auth/reset-password', {
      token,
      password: data.password,
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },
};
