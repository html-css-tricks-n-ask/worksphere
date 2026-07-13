import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';














const compensationSchema = new Schema(
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

export const Compensation = model('Compensation', compensationSchema);
export default Compensation;
