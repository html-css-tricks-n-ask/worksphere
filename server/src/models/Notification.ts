import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface INotification {
  userId: Types.ObjectId; // References User (recipient)
  companyId: Types.ObjectId;
  title: string;
  message: string;
  type: string; // e.g. 'Leave', 'Payroll', 'Announcement', 'Anniversary', 'Birthday'
  isRead: boolean;
  meta?: Schema.Types.Mixed; // e.g. { referenceId: '...' }
  createdAt: Date;
}

export interface NotificationDocument extends INotification, TenantDocument, Document {}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required.'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required.'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required.'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required.'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    meta: Schema.Types.Mixed,
  },
  baseSchemaOptions
);

// Apply tenant plugin
notificationSchema.plugin(tenantPlugin);

// Compound index to quickly fetch unread notifications for a user
notificationSchema.index({ companyId: 1, userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<NotificationDocument>('Notification', notificationSchema);
export default Notification;
