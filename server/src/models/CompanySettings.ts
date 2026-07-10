import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface ICompanySettings {
  companyId: Types.ObjectId;
  currency: string; // e.g. "USD", "INR", "EUR"
  timezone: string; // e.g. "America/New_York", "Asia/Kolkata"
  dateFormat: string; // e.g. "YYYY-MM-DD", "DD-MM-YYYY"
  language: string; // e.g. "en", "es", "fr"
  fiscalYearStart: number; // Month index (0 for Jan, 3 for Apr)
  weekendDays: number[]; // e.g. [0, 6] for Sunday, Saturday
  officeHours: {
    start: string; // "09:00"
    end: string; // "18:00"
  };
  leavePolicy: {
    sickLeaveQuota: number;
    casualLeaveQuota: number;
    paidLeaveQuota: number;
    wfhQuota: number;
  };
}

export interface CompanySettingsDocument extends ICompanySettings, TenantDocument, Document {}

const companySettingsSchema = new Schema<CompanySettingsDocument>(
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

export const CompanySettings = model<CompanySettingsDocument>('CompanySettings', companySettingsSchema);
export default CompanySettings;
