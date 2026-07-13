import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';













const shiftSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Shift name is required.'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Shift start time is required.'],
    },
    endTime: {
      type: String,
      required: [true, 'Shift end time is required.'],
    },
    gracePeriod: {
      type: Number,
      default: 15,
    },
    breakTime: {
      type: Number,
      default: 60, // 60 minutes default
    },
    workingHours: {
      type: Number,
      required: [true, 'Working hours is required.'],
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
shiftSchema.plugin(tenantPlugin);

// Compound unique index per tenant company name
shiftSchema.index({ companyId: 1, name: 1 }, { unique: true });

export const Shift = model('Shift', shiftSchema);
export default Shift;
