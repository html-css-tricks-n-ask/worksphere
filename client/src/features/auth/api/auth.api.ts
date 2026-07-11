import { axiosInstance } from '../../../services/axiosInstance.js';
import { LoginInput, RegisterFormInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema.js';

export const authApi = {
  login: async (data: LoginInput) => {
    console.log(`[CLIENT API DEBUG] Invoking authApi.login. baseURL: [${axiosInstance.defaults.baseURL}], final URL: [${axiosInstance.defaults.baseURL || ''}/auth/login]`);
    console.log(`[CLIENT API DEBUG] Request Payload:`, { email: data.email, password: '***' });
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      console.log(`[CLIENT API DEBUG] Axios POST completed. Response Status: ${response.status}`);
      return response.data;
    } catch (axiosError: any) {
      console.error(`[CLIENT API DEBUG] Axios POST failed. Error message: [${axiosError.message}], code: [${axiosError.code}], details:`, axiosError.response?.data || 'No response data');
      throw axiosError;
    }
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
