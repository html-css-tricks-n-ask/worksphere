import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormInput } from '../schemas/auth.schema.js';
import { authService } from '../services/auth.service.js';

/**
 * Custom hook managing new tenant organization registrations.
 * Hooks form, handles submit payload schema mappings, and displays success banners.
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      website: '',
      companySize: '1-10',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
  };
};
