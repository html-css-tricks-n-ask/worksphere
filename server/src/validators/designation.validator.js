import { z } from 'zod';

export const createDesignationSchema = z.object({
  title: z.string({ required_error: 'Designation title is required.' }).min(2, 'Title must be at least 2 characters.'),
  level: z.string().optional(),
  description: z.string().optional(),
});

export const updateDesignationSchema = createDesignationSchema.partial();
