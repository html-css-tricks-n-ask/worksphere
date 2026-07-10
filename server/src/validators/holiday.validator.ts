import { z } from 'zod';

export const createHolidaySchema = z.object({
  name: z.string().min(2, 'Holiday name must be at least 2 characters').max(200),
  date: z.string().datetime({ message: 'Valid ISO date required' }),
  type: z.enum(['National', 'Company', 'Optional']),
});

export const updateHolidaySchema = createHolidaySchema.partial();

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
