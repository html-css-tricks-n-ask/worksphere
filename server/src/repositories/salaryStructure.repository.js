import SalaryStructure, { } from '../models/SalaryStructure.js';

class SalaryStructureRepository {
  async create(payload) {
    return SalaryStructure.create(payload);
  }

  async findByEmployeeId(employeeId, companyId) {
    return SalaryStructure.findOne({ employeeId, companyId, status: 'Active' });
  }

  async findById(id) {
    return SalaryStructure.findById(id).populate('employeeId', 'firstName lastName email employeeId');
  }

  async update(id, payload) {
    return SalaryStructure.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id) {
    return SalaryStructure.findByIdAndDelete(id);
  }

  async findAll(query



) {
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
