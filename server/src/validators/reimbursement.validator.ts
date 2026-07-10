import { z } from 'zod';

export const createReimbursementSchema = z.object({
  title: z.string({ required_error: 'Expense title is required.' }).min(2, 'Title must be at least 2 characters.'),
  amount: z.number({ required_error: 'Amount is required.' }).positive('Amount must be greater than zero.'),
  category: z.enum(['Travel', 'Food', 'Internet', 'Medical', 'Other']),
  expenseDate: z.string().or(z.date()).transform(val => new Date(val)),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const updateReimbursementSchema = createReimbursementSchema.partial();

export const approveReimbursementSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  role: z.enum(['Manager', 'HR']),
});
