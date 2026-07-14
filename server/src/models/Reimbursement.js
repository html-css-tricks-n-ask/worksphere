import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';



















const reimbursementSchema = new Schema(
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
    approvals: [{
      approverId: { type: Schema.Types.ObjectId, ref: 'Employee' },
      role: { type: String, enum: ['Team Lead', 'Department Manager', 'HR Manager'] },
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
      comments: String,
      actionedAt: { type: Date, default: Date.now }
    }],
    currentStage: {
      type: String,
      enum: ['Team Lead', 'Department Manager', 'HR Manager'],
      default: 'Team Lead',
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
reimbursementSchema.plugin(tenantPlugin);

// Compound index to query by employee/status/category
reimbursementSchema.index({ companyId: 1, employeeId: 1, status: 1 });

export const Reimbursement = model('Reimbursement', reimbursementSchema);
export default Reimbursement;
