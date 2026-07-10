import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/softDelete.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IDesignation {
  title: string;
  level?: string;
  description?: string;
}

export interface DesignationDocument extends IDesignation, SoftDeleteDocument, TenantDocument, Document {}

const designationSchema = new Schema<DesignationDocument>(
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
  },
  baseSchemaOptions
);

// Guarantee designation title uniqueness per tenant for non-deleted records
designationSchema.index({ companyId: 1, title: 1, isDeleted: 1 }, { unique: true });

designationSchema.plugin(softDeletePlugin);
designationSchema.plugin(tenantPlugin);

export const Designation = model<DesignationDocument>('Designation', designationSchema);
export default Designation;
