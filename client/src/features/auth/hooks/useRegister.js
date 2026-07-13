 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { registerSchema, } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

/**
 * Custom hook managing new tenant organization registrations.
 * Hooks form, handles submit payload schema mappings, and displays success banners.
 */
export const useRegister = () => {
  const [success, setSuccess] = useState(false);

  const form = useForm({
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
    mutationFn: async (data) => {
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
    onError: (error) => {
      console.error('[CLIENT REGISTER] Registration mutation failed:', error);
    }
  });

  const onSubmit = (data) => {
    if (mutation.isPending) {
      console.warn('[CLIENT REGISTER] Registration submission ignored — mutation already in progress.');
      return;
    }
    mutation.mutate(data);
  };

  // Build robust prioritized error message
  let displayError = null;
  if (mutation.error) {
    const err = mutation.error ;
    if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
      displayError = 'Server connection timed out or is warming up. Please try again.';
    } else {
      displayError = _optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || err.message || 'Registration failed. Please try again.';
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

