import { z } from 'zod';

/**
 * Zod validation schema for new company and administrator registration.
 */
export const registerCompanySchema = z.object({
  company: z.object({
    name: z.string({ required_error: 'Company name is required.' }).min(2, 'Company name must be at least 2 characters.'),
    email: z.string({ required_error: 'Company email is required.' }).email('Invalid company email address.'),
    phone: z.string().optional(),
    website: z.string().url('Invalid website URL.').optional().or(z.literal('')),
    address: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.string().optional(),
  }),
  admin: z.object({
    firstName: z.string({ required_error: 'Admin first name is required.' }).min(1, 'First name is required.'),
    lastName: z.string({ required_error: 'Admin last name is required.' }).min(1, 'Last name is required.'),
    email: z.string({ required_error: 'Admin email is required.' }).email('Invalid admin email address.'),
    phone: z.string().optional(),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
  }),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required.' }).trim().email('Invalid email address.'),
  password: z.string({ required_error: 'Password is required.' }).trim().min(1, 'Password is required.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required.' }).trim().email('Invalid email address.'),
});

/**
 * Zod validation schema for resetting password credentials.
 */
export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Token is required.' }),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
});
