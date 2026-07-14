import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string({ required_error: 'Location name is required.' }).min(2, 'Name must be at least 2 characters.'),
  address: z.string().optional(),
  timezone: z.string().default('America/New_York').optional(),
});

export const updateLocationSchema = createLocationSchema.partial();
