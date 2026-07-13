import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin, } from './plugins/softDelete.js';
import { tenantPlugin, } from './plugins/tenant.js';










const departmentSchema = new Schema(
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

export const Department = model('Department', departmentSchema);
export default Department;
