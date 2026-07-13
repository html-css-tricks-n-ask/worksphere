import Shift, { } from '../models/Shift.js';

class ShiftRepository {
  async create(payload) {
    return Shift.create(payload);
  }

  async findAll(query




) {
    const filter = {};
    if (query.companyId) {
      filter.companyId = query.companyId;
    }
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const skip = (query.page - 1) * query.limit;
    const [shifts, total] = await Promise.all([
      Shift.find(filter).skip(skip).limit(query.limit).sort({ name: 1 }),
      Shift.countDocuments(filter),
    ]);

    return { shifts, total };
  }

  async findById(id) {
    return Shift.findById(id);
  }

  async update(id, payload) {
    return Shift.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id) {
    return Shift.findByIdAndDelete(id);
  }

  async findByName(name) {
    return Shift.findOne({ name });
  }
}

export const shiftRepository = new ShiftRepository();
export default shiftRepository;
