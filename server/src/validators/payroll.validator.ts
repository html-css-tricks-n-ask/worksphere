import { z } from 'zod';

export const createSalaryStructureSchema = z.object({
  employeeId: z.string({ required_error: 'Employee is required.' }).min(1, 'Employee is required.'),
  basicSalary: z.number({ required_error: 'Basic salary is required.' }).nonnegative('Salary cannot be negative.'),
  hra: z.number().nonnegative('HRA cannot be negative.').optional().default(0),
  specialAllowance: z.number().nonnegative('Allowance cannot be negative.').optional().default(0),
  conveyance: z.number().nonnegative('Allowance cannot be negative.').optional().default(0),
  medicalAllowance: z.number().nonnegative('Allowance cannot be negative.').optional().default(0),
  bonus: z.number().nonnegative('Bonus cannot be negative.').optional().default(0),
  incentive: z.number().nonnegative('Incentive cannot be negative.').optional().default(0),
  overtimePay: z.number().nonnegative('Overtime pay cannot be negative.').optional().default(0),
  pf: z.number().nonnegative('PF deduction cannot be negative.').optional().default(0),
  esi: z.number().nonnegative('ESI deduction cannot be negative.').optional().default(0),
  professionalTax: z.number().nonnegative('Professional tax cannot be negative.').optional().default(0),
  incomeTax: z.number().nonnegative('Income tax cannot be negative.').optional().default(0),
  otherDeductions: z.number().nonnegative('Deductions cannot be negative.').optional().default(0),
  effectiveDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const updateSalaryStructureSchema = createSalaryStructureSchema.partial();

export const processPayrollSchema = z.object({
  month: z.string({ required_error: 'Month is required.' }).regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format.'),
  employeeIds: z.array(z.string()).optional(), // Optional: process specific employees, or all if empty
});

export const updatePayrollStatusSchema = z.object({
  status: z.enum(['Draft', 'Processing', 'Completed', 'Locked']),
});

export const createCompensationSchema = z.object({
  employeeId: z.string({ required_error: 'Employee is required.' }),
  type: z.enum(['Salary Revision', 'Promotion Increment', 'Bonus', 'Incentive']),
  amount: z.number().nonnegative('Amount cannot be negative.'),
  effectiveDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  remarks: z.string().optional(),
});
