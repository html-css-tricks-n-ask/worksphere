import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IHoliday {
  name: string;
  date: Date;
  type: 'National' | 'Company' | 'Optional';
  companyId: Types.ObjectId;
}

export interface HolidayDocument extends IHoliday, TenantDocument, Document {}

const holidaySchema = new Schema<HolidayDocument>(
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

export const Holiday = model<HolidayDocument>('Holiday', holidaySchema);
export default Holiday;
