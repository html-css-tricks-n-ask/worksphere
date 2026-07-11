import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../schemas/auth.schema.js';
import { authService } from '../services/auth.service.js';
import { setCredentials } from '../../../redux/slices/authSlice.js';

/**
 * Custom hook to handle enterprise authentication login flow.
 * Manage form submission, validation parsing, and Redux sync.
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    console.log(`[CLIENT LOGIN DEBUG] Validation passed. Submitting login request. Email: [${data.email}] (len: ${data.email.length}), Password: [${data.password}] (len: ${data.password.length})`);
    console.log(`[CLIENT LOGIN DEBUG] VITE_API_URL env variable: [${import.meta.env.VITE_API_URL}]`);
    try {
      const authData = await authService.login(data);
      console.log(`[CLIENT LOGIN DEBUG] Login request succeeded! Response:`, authData);
      
      // Save credentials to global Redux store
      dispatch(
        setCredentials({
          user: authData.user,
          token: authData.accessToken,
        })
      );

      navigate('/dashboard');
    } catch (err: any) {
      console.error(`[CLIENT LOGIN DEBUG] Login request failed:`, err.response?.data || err);
      setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.warn('[CLIENT LOGIN DEBUG] Validation failed! Form errors:', errors);
  };

  console.log(`[CLIENT LOGIN DEBUG] rendering useLogin. errors:`, form.formState.errors);

  const result = {
    loading,
    error,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit, onInvalid),
    errors: form.formState.errors,
  };
  
  console.log('[CLIENT LOGIN DEBUG] Returning values from useLogin hook.');
  return result;
};
