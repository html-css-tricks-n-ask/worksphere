 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { setCredentials } from '../../../redux/slices/authSlice';

/**
 * Custom hook to handle enterprise authentication login flow.
 * Manage form submission, validation parsing, and Redux sync.
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await authService.login(data);
      
      // Save credentials to global Redux store
      dispatch(
        setCredentials({
          user: authData.user,
          token: authData.accessToken,
        })
      );

      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
        setError('Server is warming up — this may take up to 30 seconds on first load. Please try again.');
      } else {
        setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Login failed. Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
  };
};
