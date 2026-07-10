import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface ILeave {
  employeeId: Types.ObjectId; // References Employee
  companyId: Types.ObjectId;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Work From Home';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  attachment?: string; // Cloudinary url
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approvedBy?: Types.ObjectId; // References User
  approvedAt?: Date;
}

export interface LeaveDocument extends ILeave, TenantDocument, Document {}

const leaveSchema = new Schema<LeaveDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required.'],
    },
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Sick Leave', 'Paid Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Work From Home'],
      required: [true, 'Leave type is required.'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required.'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required.'],
    },
    totalDays: {
      type: Number,
      required: [true, 'Total leave days calculation is required.'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required.'],
      trim: true,
    },
    attachment: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
leaveSchema.plugin(tenantPlugin);

// Compound indexes for employee specific leaves search
leaveSchema.index({ companyId: 1, employeeId: 1, startDate: 1 });

export const Leave = model<LeaveDocument>('Leave', leaveSchema);
export default Leave;
