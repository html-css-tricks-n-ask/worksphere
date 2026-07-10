import Holiday, { HolidayDocument } from '../models/Holiday.js';

class HolidayRepository {
  async create(payload: Partial<HolidayDocument>): Promise<HolidayDocument> {
    return Holiday.create(payload);
  }

  async findAll(query: {
    companyId?: string;
    year?: number;
    page: number;
    limit: number;
  }): Promise<{ holidays: HolidayDocument[]; total: number }> {
    const filter: any = {};
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

  async findById(id: string): Promise<HolidayDocument | null> {
    return Holiday.findById(id);
  }

  async update(id: string, payload: Partial<HolidayDocument>): Promise<HolidayDocument | null> {
    return Holiday.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id: string): Promise<HolidayDocument | null> {
    return Holiday.findByIdAndDelete(id);
  }

  async findByDate(date: Date, companyId: string): Promise<HolidayDocument | null> {
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
