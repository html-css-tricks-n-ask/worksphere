import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string({ required_error: 'Company name is required.' }).min(2, 'Name must be at least 2 characters.'),
  email: z.string({ required_error: 'Company email is required.' }).email('Invalid email address format.'),
  slug: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL.').optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  subscriptionPlan: z.enum(['Free', 'Basic', 'Premium', 'Enterprise']).optional(),
  subscriptionStatus: z.enum(['Active', 'Suspended', 'Expired']).optional(),
  maxEmployees: z.number().int().min(1, 'Max employees must be at least 1.').optional(),
  expiresAt: z.string().datetime().optional().or(z.literal('')).or(z.null()),
});

export const updateCompanySchema = createCompanySchema.partial();
