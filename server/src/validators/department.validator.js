import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string({ required_error: 'Department name is required.' }).min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
  departmentHead: z.string().optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
