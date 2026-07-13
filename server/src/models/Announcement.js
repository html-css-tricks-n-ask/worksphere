import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';













const announcementSchema = new Schema(
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

export const Announcement = model('Announcement', announcementSchema);
export default Announcement;
