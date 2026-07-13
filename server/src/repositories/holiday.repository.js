import Holiday, { } from '../models/Holiday.js';

class HolidayRepository {
  async create(payload) {
    return Holiday.create(payload);
  }

  async findAll(query




) {
    const filter = {};
    if (query.companyId) {
      filter.companyId = query.companyId;
    }
    if (query.year) {
      const start = new Date(query.year, 0, 1);
      const end = new Date(query.year, 11, 31, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (query.page - 1) * query.limit;
    const [holidays, total] = await Promise.all([
      Holiday.find(filter).skip(skip).limit(query.limit).sort({ date: 1 }),
      Holiday.countDocuments(filter),
    ]);

    return { holidays, total };
  }

  async findById(id) {
    return Holiday.findById(id);
  }

  async update(id, payload) {
    return Holiday.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id) {
    return Holiday.findByIdAndDelete(id);
  }

  async findByDate(date, companyId) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return Holiday.findOne({
      companyId,
      date: { $gte: start, $lte: end },
    });
  }
}

export const holidayRepository = new HolidayRepository();
export default holidayRepository;
