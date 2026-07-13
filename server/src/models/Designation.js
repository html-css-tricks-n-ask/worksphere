import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin, } from './plugins/softDelete.js';
import { tenantPlugin, } from './plugins/tenant.js';









const designationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Designation title is required.'],
      trim: true,
    },
    level: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department mapping is required.'],
    },
  },
  baseSchemaOptions
);

// Guarantee designation title uniqueness per tenant for non-deleted records
designationSchema.index({ companyId: 1, title: 1, isDeleted: 1 }, { unique: true });

designationSchema.plugin(softDeletePlugin);
designationSchema.plugin(tenantPlugin);

export const Designation = model('Designation', designationSchema);
export default Designation;
