import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IPayroll {
  employeeId: Types.ObjectId; // References Employee
  companyId: Types.ObjectId;
  month: string; // Format: "YYYY-MM"
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medicalAllowance: number;
  bonus: number;
  incentive: number;
  overtimePay: number;
  pf: number;
  esi: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  workingDays: number;
  paidDays: number;
  leaveDeductions: number;
  status: 'Draft' | 'Processing' | 'Completed' | 'Locked';
  payslipUrl?: string;
  lockedBy?: Types.ObjectId; // References User
  lockedAt?: Date;
}

export interface PayrollDocument extends IPayroll, TenantDocument, Document {}

const payrollSchema = new Schema<PayrollDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required.'],
    },
    month: {
      type: String,
      required: [true, 'Payroll month (YYYY-MM) is required.'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format.'],
    },
    basicSalary: { type: Number, default: 0, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    specialAllowance: { type: Number, default: 0, min: 0 },
    conveyance: { type: Number, default: 0, min: 0 },
    medicalAllowance: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    incentive: { type: Number, default: 0, min: 0 },
    overtimePay: { type: Number, default: 0, min: 0 },
    pf: { type: Number, default: 0, min: 0 },
    esi: { type: Number, default: 0, min: 0 },
    professionalTax: { type: Number, default: 0, min: 0 },
    incomeTax: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    workingDays: { type: Number, default: 30, min: 0 },
    paidDays: { type: Number, default: 30, min: 0 },
    leaveDeductions: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Processing', 'Completed', 'Locked'],
      default: 'Draft',
    },
    payslipUrl: String,
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lockedAt: Date,
  },
  baseSchemaOptions
);

// Apply tenant plugin
payrollSchema.plugin(tenantPlugin);

// Unique index: Employee can only have one payroll entry per month
payrollSchema.index({ companyId: 1, employeeId: 1, month: 1 }, { unique: true });

// Pre-save validation hook: Auto-calculate totals
payrollSchema.pre('validate', function (this: any, next) {
  this.totalEarnings = parseFloat((
    (this.basicSalary || 0) +
    (this.hra || 0) +
    (this.specialAllowance || 0) +
    (this.conveyance || 0) +
    (this.medicalAllowance || 0) +
    (this.bonus || 0) +
    (this.incentive || 0) +
    (this.overtimePay || 0)
  ).toFixed(2));

  this.totalDeductions = parseFloat((
    (this.pf || 0) +
    (this.esi || 0) +
    (this.professionalTax || 0) +
    (this.incomeTax || 0) +
    (this.otherDeductions || 0) +
    (this.leaveDeductions || 0)
  ).toFixed(2));

  this.netSalary = Math.max(0, parseFloat((this.totalEarnings - this.totalDeductions).toFixed(2)));
  next();
});

export const Payroll = model<PayrollDocument>('Payroll', payrollSchema);
export default Payroll;
