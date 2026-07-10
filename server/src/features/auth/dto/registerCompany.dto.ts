import { z } from 'zod';
import { registerCompanySchema } from '../validators/auth.validator.js';

/**
 * Data Transfer Object for tenant corporate and admin registration requests.
 */
export type RegisterCompanyDto = z.infer<typeof registerCompanySchema>;
