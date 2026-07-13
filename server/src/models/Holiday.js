import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';










const holidaySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Holiday name is required.'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required.'],
    },
    type: {
      type: String,
      enum: ['National', 'Company', 'Optional'],
      required: [true, 'Holiday type is required.'],
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
holidaySchema.plugin(tenantPlugin);

// Compound index per tenant company date for prevention of duplicates
holidaySchema.index({ companyId: 1, date: 1 }, { unique: true });

export const Holiday = model('Holiday', holidaySchema);
export default Holiday;
