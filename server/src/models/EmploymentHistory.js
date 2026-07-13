import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';












const employmentHistorySchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required.'],
      index: true,
    },
    type: {
      type: String,
      enum: ['Promotion', 'Department Change', 'Designation Change', 'Salary Revision', 'Other'],
      required: [true, 'History event type is required.'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required.'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  baseSchemaOptions
);

employmentHistorySchema.plugin(tenantPlugin);

export const EmploymentHistory = model('EmploymentHistory', employmentHistorySchema);
export default EmploymentHistory;
