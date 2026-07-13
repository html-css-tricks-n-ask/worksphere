 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { axiosInstance } from '../../../services/axiosInstance';


export const authApi = {
  login: async (data) => {
    console.log(`[CLIENT API DEBUG] Invoking authApi.login. baseURL: [${axiosInstance.defaults.baseURL}], final URL: [${axiosInstance.defaults.baseURL || ''}/auth/login]`);
    console.log(`[CLIENT API DEBUG] Request Payload:`, { email: data.email, password: '***' });
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      console.log(`[CLIENT API DEBUG] Axios POST completed. Response Status: ${response.status}`);
      return response.data;
    } catch (axiosError) {
      console.error(`[CLIENT API DEBUG] Axios POST failed. Error message: [${axiosError.message}], code: [${axiosError.code}], details:`, _optionalChain([axiosError, 'access', _ => _.response, 'optionalAccess', _2 => _2.data]) || 'No response data');
      throw axiosError;
    }
  },

  register: async (data) => {
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

  forgotPassword: async (data) => {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email: data.email,
    });
    return response.data;
  },

  resetPassword: async (token, data) => {
    const response = await axiosInstance.post('/auth/reset-password', {
      token,
      password: data.password,
    });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },
};
