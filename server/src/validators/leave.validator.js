import { z } from 'zod';

export const applyLeaveSchema = z
  .object({
    leaveType: z.enum([
      'Casual Leave',
      'Sick Leave',
      'Paid Leave',
      'Earned Leave',
      'Maternity Leave',
      'Paternity Leave',
      'Work From Home',
    ]),
    startDate: z.string().datetime({ message: 'Valid ISO date required for startDate' }),
    endDate: z.string().datetime({ message: 'Valid ISO date required for endDate' }),
    reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000),
    attachment: z.string().url('Attachment must be a valid URL').optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  });

export const updateLeaveStatusSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Cancelled']),
  comments: z.string().optional(),
});

 

