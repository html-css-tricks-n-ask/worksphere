import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string({ required_error: 'Team name is required.' }).min(2, 'Name must be at least 2 characters.'),
  departmentId: z.string({ required_error: 'Department ID is required.' }),
  managerId: z.string().nullable().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();
