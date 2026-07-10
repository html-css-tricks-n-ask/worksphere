import SalaryStructure, { SalaryStructureDocument } from '../models/SalaryStructure.js';

class SalaryStructureRepository {
  async create(payload: Partial<SalaryStructureDocument>): Promise<SalaryStructureDocument> {
    return SalaryStructure.create(payload);
  }

  async findByEmployeeId(employeeId: string, companyId: string): Promise<SalaryStructureDocument | null> {
    return SalaryStructure.findOne({ employeeId, companyId, status: 'Active' });
  }

  async findById(id: string): Promise<SalaryStructureDocument | null> {
    return SalaryStructure.findById(id).populate('employeeId', 'firstName lastName email employeeId');
  }

  async update(id: string, payload: Partial<SalaryStructureDocument>): Promise<SalaryStructureDocument | null> {
    return SalaryStructure.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id: string): Promise<SalaryStructureDocument | null> {
    return SalaryStructure.findByIdAndDelete(id);
  }

  async findAll(query: {
    companyId: string;
    page: number;
    limit: number;
  }): Promise<{ structures: SalaryStructureDocument[]; total: number }> {
    const filter = { companyId: query.companyId };
    const skip = (query.page - 1) * query.limit;

    const [structures, total] = await Promise.all([
      SalaryStructure.find(filter)
        .populate('employeeId', 'firstName lastName email employeeId')
        .skip(skip)
        .limit(query.limit)
        .sort({ createdAt: -1 }),
      SalaryStructure.countDocuments(filter),
    ]);

    return { structures, total };
  }
}

export const salaryStructureRepository = new SalaryStructureRepository();
export default salaryStructureRepository;
