import { z } from 'zod';
import { loginSchema } from '../validators/auth.validator.js';

/**
 * Data Transfer Object for authentication Login requests.
 */
export type LoginDto = z.infer<typeof loginSchema>;
