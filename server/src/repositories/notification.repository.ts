import Notification, { NotificationDocument } from '../models/Notification.js';

class NotificationRepository {
  async create(payload: Partial<NotificationDocument>): Promise<NotificationDocument> {
    return Notification.create(payload);
  }

  async findById(id: string): Promise<NotificationDocument | null> {
    return Notification.findById(id);
  }

  async update(id: string, payload: Partial<NotificationDocument>): Promise<NotificationDocument | null> {
    return Notification.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async markAllRead(userId: string, companyId: string): Promise<void> {
    await Notification.updateMany({ userId, companyId, isRead: false }, { $set: { isRead: true } });
  }

  async delete(id: string): Promise<NotificationDocument | null> {
    return Notification.findByIdAndDelete(id);
  }

  async findAll(query: {
    companyId: string;
    userId: string;
    isRead?: boolean;
    page: number;
    limit: number;
  }): Promise<{ notifications: NotificationDocument[]; total: number }> {
    const filter: any = { companyId: query.companyId, userId: query.userId };
    if (query.isRead !== undefined) {
      filter.isRead = query.isRead;
    }

    const skip = (query.page - 1) * query.limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .skip(skip)
        .limit(query.limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(filter),
    ]);

    return { notifications, total };
  }
}

export const notificationRepository = new NotificationRepository();
export default notificationRepository;
