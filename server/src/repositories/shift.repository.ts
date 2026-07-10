import Shift, { ShiftDocument } from '../models/Shift.js';

class ShiftRepository {
  async create(payload: Partial<ShiftDocument>): Promise<ShiftDocument> {
    return Shift.create(payload);
  }

  async findAll(query: {
    companyId?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ shifts: ShiftDocument[]; total: number }> {
    const filter: any = {};
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

  async findById(id: string): Promise<ShiftDocument | null> {
    return Shift.findById(id);
  }

  async update(id: string, payload: Partial<ShiftDocument>): Promise<ShiftDocument | null> {
    return Shift.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id: string): Promise<ShiftDocument | null> {
    return Shift.findByIdAndDelete(id);
  }

  async findByName(name: string): Promise<ShiftDocument | null> {
    return Shift.findOne({ name });
  }
}

export const shiftRepository = new ShiftRepository();
export default shiftRepository;
