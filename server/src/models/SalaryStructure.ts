import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface ISalaryStructure {
  employeeId: Types.ObjectId; // References Employee
  companyId: Types.ObjectId;
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
  netSalary: number;
  effectiveDate: Date;
  status: 'Active' | 'Inactive';
}

export interface SalaryStructureDocument extends ISalaryStructure, TenantDocument, Document {}

const salaryStructureSchema = new Schema<SalaryStructureDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required.'],
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required.'],
      min: [0, 'Salary cannot be negative.'],
    },
    hra: {
      type: Number,
      default: 0,
      min: [0, 'Allowances cannot be negative.'],
    },
    specialAllowance: {
      type: Number,
      default: 0,
      min: [0, 'Allowances cannot be negative.'],
    },
    conveyance: {
      type: Number,
      default: 0,
      min: [0, 'Allowances cannot be negative.'],
    },
    medicalAllowance: {
      type: Number,
      default: 0,
      min: [0, 'Allowances cannot be negative.'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative.'],
    },
    incentive: {
      type: Number,
      default: 0,
      min: [0, 'Incentive cannot be negative.'],
    },
    overtimePay: {
      type: Number,
      default: 0,
      min: [0, 'Overtime pay cannot be negative.'],
    },
    pf: {
      type: Number,
      default: 0,
      min: [0, 'PF deduction cannot be negative.'],
    },
    esi: {
      type: Number,
      default: 0,
      min: [0, 'ESI deduction cannot be negative.'],
    },
    professionalTax: {
      type: Number,
      default: 0,
      min: [0, 'Professional tax deduction cannot be negative.'],
    },
    incomeTax: {
      type: Number,
      default: 0,
      min: [0, 'Income tax deduction cannot be negative.'],
    },
    otherDeductions: {
      type: Number,
      default: 0,
      min: [0, 'Deductions cannot be negative.'],
    },
    netSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required.'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
salaryStructureSchema.plugin(tenantPlugin);

// Unique index: One active salary structure per employee
salaryStructureSchema.index({ companyId: 1, employeeId: 1, status: 1 });

// Pre-save validation hook: Auto-calculate Net Salary
salaryStructureSchema.pre('validate', function (this: any, next) {
  const earnings =
    (this.basicSalary || 0) +
    (this.hra || 0) +
    (this.specialAllowance || 0) +
    (this.conveyance || 0) +
    (this.medicalAllowance || 0) +
    (this.bonus || 0) +
    (this.incentive || 0) +
    (this.overtimePay || 0);

  const deductions =
    (this.pf || 0) +
    (this.esi || 0) +
    (this.professionalTax || 0) +
    (this.incomeTax || 0) +
    (this.otherDeductions || 0);

  this.netSalary = Math.max(0, parseFloat((earnings - deductions).toFixed(2)));
  next();
});

export const SalaryStructure = model<SalaryStructureDocument>('SalaryStructure', salaryStructureSchema);
export default SalaryStructure;
