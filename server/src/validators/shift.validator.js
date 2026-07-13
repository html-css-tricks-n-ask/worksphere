import { z } from 'zod';

export const createShiftSchema = z.object({
  name: z.string().min(2, 'Shift name must be at least 2 characters').max(100),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'),
  gracePeriod: z.number().min(0).max(60).optional().default(15),
  breakTime: z.number().min(0).max(120).optional().default(60),
  workingHours: z.number().min(1).max(24),
});

export const updateShiftSchema = createShiftSchema.partial();

 

