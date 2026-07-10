import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IEmploymentHistory {
  employeeId: Types.ObjectId; // References Employee
  type: 'Promotion' | 'Department Change' | 'Designation Change' | 'Salary Revision' | 'Other';
  description: string;
  date: Date;
  details?: Schema.Types.Mixed; // e.g. { previous: 'Software Engineer', new: 'Senior Software Engineer' }
  companyId: Types.ObjectId;
}

export interface EmploymentHistoryDocument extends IEmploymentHistory, TenantDocument, Document {}

const employmentHistorySchema = new Schema<EmploymentHistoryDocument>(
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

export const EmploymentHistory = model<EmploymentHistoryDocument>('EmploymentHistory', employmentHistorySchema);
export default EmploymentHistory;
