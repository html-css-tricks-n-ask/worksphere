import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IAuditLog {
  actorId?: Types.ObjectId; // References User
  action: string; // e.g. "CREATE_EMPLOYEE"
  ipAddress?: string;
  userAgent?: string;
  details?: Schema.Types.Mixed;
  timestamp: Date;
  companyId: Types.ObjectId;
}

export interface AuditLogDocument extends IAuditLog, TenantDocument, Document {}

const auditLogSchema = new Schema<AuditLogDocument>(
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

export const AuditLog = model<AuditLogDocument>('AuditLog', auditLogSchema);
export default AuditLog;
