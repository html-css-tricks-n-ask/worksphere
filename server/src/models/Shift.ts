import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IShift {
  name: string; // e.g. "Morning Shift", "Night Shift", "Flexible"
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  gracePeriod: number; // in minutes
  breakTime: number; // in minutes
  workingHours: number;
  companyId: Types.ObjectId;
}

export interface ShiftDocument extends IShift, TenantDocument, Document {}

const shiftSchema = new Schema<ShiftDocument>(
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

export const Shift = model<ShiftDocument>('Shift', shiftSchema);
export default Shift;
