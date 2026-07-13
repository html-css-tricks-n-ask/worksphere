import Announcement, { } from '../models/Announcement.js';

class AnnouncementRepository {
  async create(payload) {
    return Announcement.create(payload);
  }

  async findById(id) {
    return Announcement.findById(id).populate('targetDepartmentId', 'name');
  }

  async update(id, payload) {
    return Announcement.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id) {
    return Announcement.findByIdAndDelete(id);
  }

  async findAll(query




) {
    const filter = { companyId: query.companyId };
    
    // Support targeting logic: either general (no department restriction) or employee's department
    if (query.departmentId) {
      filter.$or = [
        { targetDepartmentId: { $exists: false } },
        { targetDepartmentId: null },
        { targetDepartmentId: query.departmentId },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('targetDepartmentId', 'name')
        .skip(skip)
        .limit(query.limit)
        .sort({ pinned: -1, publishDate: -1 }),
      Announcement.countDocuments(filter),
    ]);

    return { announcements, total };
  }
}

export const announcementRepository = new AnnouncementRepository();
export default announcementRepository;
