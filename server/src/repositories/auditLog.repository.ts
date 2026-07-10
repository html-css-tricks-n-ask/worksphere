import { AuditLog, AuditLogDocument, IAuditLog } from '../models/AuditLog.js';

export class AuditLogRepository {
  async create(data: Partial<IAuditLog>): Promise<AuditLogDocument> {
    return AuditLog.create(data);
  }

  async findAll(limit = 100): Promise<AuditLogDocument[]> {
    return AuditLog.find({})
      .populate('actorId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}

export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;
