import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface ICompensation {
  employeeId: Types.ObjectId; // References Employee
  companyId: Types.ObjectId;
  type: 'Salary Revision' | 'Promotion Increment' | 'Bonus' | 'Incentive';
  amount: number;
  previousSalary: number;
  newSalary: number;
  effectiveDate: Date;
  remarks?: string;
}

export interface CompensationDocument extends ICompensation, TenantDocument, Document {}

const compensationSchema = new Schema<CompensationDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required.'],
    },
    type: {
      type: String,
      enum: ['Salary Revision', 'Promotion Increment', 'Bonus', 'Incentive'],
      required: [true, 'Compensation type is required.'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
      min: [0, 'Amount cannot be negative.'],
    },
    previousSalary: {
      type: Number,
      default: 0,
    },
    newSalary: {
      type: Number,
      default: 0,
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required.'],
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
compensationSchema.plugin(tenantPlugin);

// Index to query history of an employee
compensationSchema.index({ companyId: 1, employeeId: 1, effectiveDate: -1 });

export const Compensation = model<CompensationDocument>('Compensation', compensationSchema);
export default Compensation;
