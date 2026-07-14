import { z } from 'zod';

export const personalInfoSchema = z.object({
  dateOfBirth: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  nationality: z.string().optional(),
});

export const professionalInfoSchema = z.object({
  departmentId: z.string().min(1, 'Department is required.').optional().or(z.literal('')),
  designationId: z.string().min(1, 'Designation is required.').optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')).or(z.null()),
  teamLeadId: z.string().optional().or(z.literal('')).or(z.null()),
  locationId: z.string().optional().or(z.literal('')).or(z.null()),
  teamId: z.string().optional().or(z.literal('')).or(z.null()),
  joiningDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern']).default('Full-Time'),
  workLocation: z.string().optional(),
  salaryGrade: z.string().optional(),
});

export const addressSchema = z.object({
  currentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
});

export const emergencyContactSchema = z.object({
  contactName: z.string().optional(),
  relation: z.string().optional(),
  phone: z.string().optional(),
});

export const experienceItemSchema = z.object({
  company: z.string().min(1, 'Company name is required.'),
  role: z.string().min(1, 'Role title is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  description: z.string().optional(),
});

export const educationItemSchema = z.object({
  degree: z.string().min(1, 'Degree name is required.'),
  college: z.string().optional(),
  university: z.string().optional(),
  year: z.number().int().min(1950, 'Invalid year.').max(new Date().getFullYear() + 5),
  percentage: z.number().optional(),
});

export const createEmployeeSchema = z.object({
  employeeId: z.string({ required_error: 'Employee ID is required.' }).min(2, 'Employee ID must be at least 2 characters.'),
  firstName: z.string({ required_error: 'First name is required.' }).min(1, 'First name is required.'),
  lastName: z.string({ required_error: 'Last name is required.' }).min(1, 'Last name is required.'),
  email: z.string({ required_error: 'Email address is required.' }).email('Invalid email address.'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  personalInfo: personalInfoSchema.optional(),
  professionalInfo: professionalInfoSchema.optional(),
  address: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(experienceItemSchema).optional(),
  education: z.array(educationItemSchema).optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
