import Compensation, { CompensationDocument } from '../models/Compensation.js';

class CompensationRepository {
  async create(payload: Partial<CompensationDocument>): Promise<CompensationDocument> {
    return Compensation.create(payload);
  }

  async findById(id: string): Promise<CompensationDocument | null> {
    return Compensation.findById(id).populate('employeeId', 'firstName lastName email employeeId');
  }

  async findHistory(employeeId: string, companyId: string): Promise<CompensationDocument[]> {
    return Compensation.find({ employeeId, companyId }).sort({ effectiveDate: -1 });
  }

  async update(id: string, payload: Partial<CompensationDocument>): Promise<CompensationDocument | null> {
    return Compensation.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id: string): Promise<CompensationDocument | null> {
    return Compensation.findByIdAndDelete(id);
  }

  async findAll(query: {
    companyId: string;
    employeeId?: string;
    page: number;
    limit: number;
  }): Promise<{ history: CompensationDocument[]; total: number }> {
    const filter: any = { companyId: query.companyId };
    if (query.employeeId) filter.employeeId = query.employeeId;

    const skip = (query.page - 1) * query.limit;

    const [history, total] = await Promise.all([
      Compensation.find(filter)
        .populate('employeeId', 'firstName lastName email employeeId')
        .skip(skip)
        .limit(query.limit)
        .sort({ effectiveDate: -1 }),
      Compensation.countDocuments(filter),
    ]);

    return { history, total };
  }
}

export const compensationRepository = new CompensationRepository();
export default compensationRepository;
