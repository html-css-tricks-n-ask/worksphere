import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';























const companySettingsSchema = new Schema(
  {
    currency: {
      type: String,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    language: {
      type: String,
      default: 'en',
    },
    fiscalYearStart: {
      type: Number,
      default: 0, // Jan
    },
    weekendDays: {
      type: [Number],
      default: [0, 6], // Saturday and Sunday
    },
    officeHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
    leavePolicy: {
      sickLeaveQuota: { type: Number, default: 10 },
      casualLeaveQuota: { type: Number, default: 12 },
      paidLeaveQuota: { type: Number, default: 15 },
      wfhQuota: { type: Number, default: 30 },
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
companySettingsSchema.plugin(tenantPlugin);

// Unique index: One settings document per company
companySettingsSchema.index({ companyId: 1 }, { unique: true });

export const CompanySettings = model('CompanySettings', companySettingsSchema);
export default CompanySettings;
