import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IAnnouncement {
  title: string;
  content: string; // Rich text / Markdown
  pinned: boolean;
  targetDepartmentId?: Types.ObjectId; // References Department (optional, if restricted to department)
  companyId: Types.ObjectId;
  publishDate: Date;
  expiryDate?: Date;
}

export interface AnnouncementDocument extends IAnnouncement, TenantDocument, Document {}

const announcementSchema = new Schema<AnnouncementDocument>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required.'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required.'],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    targetDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    publishDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: Date,
  },
  baseSchemaOptions
);

// Apply tenant plugin
announcementSchema.plugin(tenantPlugin);

// Compound index to query active pinned announcements
announcementSchema.index({ companyId: 1, pinned: -1, publishDate: -1 });

export const Announcement = model<AnnouncementDocument>('Announcement', announcementSchema);
export default Announcement;
