import { Schema, model } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin } from './plugins/softDelete.js';
import { tenantPlugin } from './plugins/tenant.js';

const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required.'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      default: 'America/New_York',
      trim: true,
    },
  },
  baseSchemaOptions
);

// Compound index to ensure name uniqueness per tenant
locationSchema.index({ companyId: 1, name: 1, isDeleted: 1 }, { unique: true });

locationSchema.plugin(softDeletePlugin);
locationSchema.plugin(tenantPlugin);

export const Location = model('Location', locationSchema);
export default Location;
