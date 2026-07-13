import Reimbursement, { } from '../models/Reimbursement.js';

class ReimbursementRepository {
  async create(payload) {
    return Reimbursement.create(payload);
  }

  async findById(id) {
    return Reimbursement.findById(id)
      .populate('employeeId', 'firstName lastName email employeeId')
      .populate('managerApprovedBy', 'firstName lastName')
      .populate('hrApprovedBy', 'firstName lastName');
  }

  async update(id, payload) {
    return Reimbursement.findByIdAndUpdate(id, { $set: payload }, { new: true })
      .populate('employeeId', 'firstName lastName email employeeId');
  }

  async delete(id) {
    return Reimbursement.findByIdAndDelete(id);
  }

  async findAll(query






) {
    const filter = { companyId: query.companyId };
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;

    const skip = (query.page - 1) * query.limit;

    const [claims, total] = await Promise.all([
      Reimbursement.find(filter)
        .populate('employeeId', 'firstName lastName email employeeId')
        .skip(skip)
        .limit(query.limit)
        .sort({ expenseDate: -1 }),
      Reimbursement.countDocuments(filter),
    ]);

    return { claims, total };
  }
}

export const reimbursementRepository = new ReimbursementRepository();
export default reimbursementRepository;
