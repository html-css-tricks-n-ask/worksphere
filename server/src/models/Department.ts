import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/softDelete.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IDepartment {
  name: string;
  description?: string;
  departmentHead?: Schema.Types.ObjectId; // References Employee
  status: 'Active' | 'Inactive';
}

export interface DepartmentDocument extends IDepartment, SoftDeleteDocument, TenantDocument, Document {}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    departmentHead: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  baseSchemaOptions
);

// Compound index to guarantee department name uniqueness per company for active departments
departmentSchema.index({ companyId: 1, name: 1, isDeleted: 1 }, { unique: true });

departmentSchema.plugin(softDeletePlugin);
departmentSchema.plugin(tenantPlugin);

export const Department = model<DepartmentDocument>('Department', departmentSchema);
export default Department;
