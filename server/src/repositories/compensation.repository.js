import Compensation, { } from '../models/Compensation.js';

class CompensationRepository {
  async create(payload) {
    return Compensation.create(payload);
  }

  async findById(id) {
    return Compensation.findById(id).populate('employeeId', 'firstName lastName email employeeId');
  }

  async findHistory(employeeId, companyId) {
    return Compensation.find({ employeeId, companyId }).sort({ effectiveDate: -1 });
  }

  async update(id, payload) {
    return Compensation.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id) {
    return Compensation.findByIdAndDelete(id);
  }

  async findAll(query




) {
    const filter = { companyId: query.companyId };
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
