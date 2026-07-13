import Notification, { } from '../models/Notification.js';

class NotificationRepository {
  async create(payload) {
    return Notification.create(payload);
  }

  async findById(id) {
    return Notification.findById(id);
  }

  async update(id, payload) {
    return Notification.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async markAllRead(userId, companyId) {
    await Notification.updateMany({ userId, companyId, isRead: false }, { $set: { isRead: true } });
  }

  async delete(id) {
    return Notification.findByIdAndDelete(id);
  }

  async findAll(query





) {
    const filter = { companyId: query.companyId, userId: query.userId };
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
