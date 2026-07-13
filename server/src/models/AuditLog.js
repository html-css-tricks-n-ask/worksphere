import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';













const auditLogSchema = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required.'],
      index: true,
    },
    ipAddress: String,
    userAgent: String,
    details: Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  baseSchemaOptions
);

auditLogSchema.plugin(tenantPlugin);

export const AuditLog = model('AuditLog', auditLogSchema);
export default AuditLog;
