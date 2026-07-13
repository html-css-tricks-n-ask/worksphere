import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { registerSchema, RegisterFormInput } from '../schemas/auth.schema.js';
import { authService } from '../services/auth.service.js';

/**
 * Custom hook managing new tenant organization registrations.
 * Hooks form, handles submit payload schema mappings, and displays success banners.
 */
export const useRegister = () => {
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

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormInput) => {
      console.log('[CLIENT REGISTER] Dispatching registration mutation payload...', {
        company: { name: data.companyName, email: data.companyEmail },
        admin: { firstName: data.adminFirstName, email: data.adminEmail }
      });
      return await authService.register(data);
    },
    onSuccess: (response) => {
      console.log('[CLIENT REGISTER] Registration mutation succeeded:', response);
      setSuccess(true);
    },
    onError: (error: any) => {
      console.error('[CLIENT REGISTER] Registration mutation failed:', error);
    }
  });

  const onSubmit = (data: RegisterFormInput) => {
    if (mutation.isPending) {
      console.warn('[CLIENT REGISTER] Registration submission ignored — mutation already in progress.');
      return;
    }
    mutation.mutate(data);
  };

  // Build robust prioritized error message
  let displayError: string | null = null;
  if (mutation.error) {
    const err = mutation.error as any;
    if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
      displayError = 'Server connection timed out or is warming up. Please try again.';
    } else {
      displayError = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
    }
  }

  return {
    loading: mutation.isPending,
    error: displayError,
    success,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
  };
};

