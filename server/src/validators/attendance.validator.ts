import { z } from 'zod';

export const checkInSchema = z.object({
  attendanceType: z.enum(['Web', 'Mobile', 'QR', 'GPS', 'Manual']).default('Web'),
  location: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  qrCode: z.string().optional(),
  remarks: z.string().max(500).optional(),
});

export const checkOutSchema = z.object({
  remarks: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const manualAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  checkIn: z.string().datetime({ message: 'Valid ISO datetime required for checkIn' }),
  checkOut: z.string().datetime({ message: 'Valid ISO datetime required for checkOut' }).optional(),
  attendanceType: z.enum(['Web', 'Mobile', 'QR', 'GPS', 'Manual']).default('Manual'),
  status: z.enum(['Present', 'Absent', 'Leave', 'Holiday', 'Weekend', 'Half Day']).default('Present'),
  remarks: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
