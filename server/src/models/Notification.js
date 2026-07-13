import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';














const notificationSchema = new Schema(
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

export const Notification = model('Notification', notificationSchema);
export default Notification;
