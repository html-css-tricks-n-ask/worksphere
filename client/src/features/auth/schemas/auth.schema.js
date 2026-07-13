import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid work email address.'),
  password: z.string().trim().min(1, 'Password is required.'),
});

 

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  companyEmail: z.string().trim().email('Invalid company email.'),
  companyPhone: z.string().optional(),
  website: z.string().url('Invalid website URL.').optional().or(z.literal('')),
  companySize: z.string().optional(),
  adminFirstName: z.string().min(1, 'First name is required.'),
  adminLastName: z.string().min(1, 'Last name is required.'),
  adminEmail: z.string().trim().email('Invalid email.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character.'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms.' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

 

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address.'),
});

 

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

 
