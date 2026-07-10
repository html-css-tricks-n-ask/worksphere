import { z } from 'zod';

export const updateCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters.').optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL.').optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  logo: z.string().url('Invalid logo URL.').optional().or(z.literal('')),
});
