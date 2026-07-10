import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IReimbursement {
  employeeId: Types.ObjectId; // References Employee
  companyId: Types.ObjectId;
  title: string;
  amount: number;
  category: 'Travel' | 'Food' | 'Internet' | 'Medical' | 'Other';
  expenseDate: Date;
  description?: string;
  receiptUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  managerApprovedBy?: Types.ObjectId; // References User
  managerApprovedAt?: Date;
  hrApprovedBy?: Types.ObjectId; // References User
  hrApprovedAt?: Date;
}

export interface ReimbursementDocument extends IReimbursement, TenantDocument, Document {}

const reimbursementSchema = new Schema<ReimbursementDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required.'],
    },
    title: {
      type: String,
      required: [true, 'Expense title is required.'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required.'],
      min: [0.01, 'Amount must be greater than zero.'],
    },
    category: {
      type: String,
      enum: ['Travel', 'Food', 'Internet', 'Medical', 'Other'],
      required: [true, 'Category is required.'],
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required.'],
    },
    description: {
      type: String,
      trim: true,
    },
    receiptUrl: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
      default: 'Pending',
    },
    managerApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    managerApprovedAt: Date,
    hrApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    hrApprovedAt: Date,
  },
  baseSchemaOptions
);

// Apply tenant plugin
reimbursementSchema.plugin(tenantPlugin);

// Compound index to query by employee/status/category
reimbursementSchema.index({ companyId: 1, employeeId: 1, status: 1 });

export const Reimbursement = model<ReimbursementDocument>('Reimbursement', reimbursementSchema);
export default Reimbursement;
