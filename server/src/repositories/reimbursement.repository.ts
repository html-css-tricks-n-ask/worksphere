import Reimbursement, { ReimbursementDocument } from '../models/Reimbursement.js';

class ReimbursementRepository {
  async create(payload: Partial<ReimbursementDocument>): Promise<ReimbursementDocument> {
    return Reimbursement.create(payload);
  }

  async findById(id: string): Promise<ReimbursementDocument | null> {
    return Reimbursement.findById(id)
      .populate('employeeId', 'firstName lastName email employeeId')
      .populate('managerApprovedBy', 'firstName lastName')
      .populate('hrApprovedBy', 'firstName lastName');
  }

  async update(id: string, payload: Partial<ReimbursementDocument>): Promise<ReimbursementDocument | null> {
    return Reimbursement.findByIdAndUpdate(id, { $set: payload }, { new: true })
      .populate('employeeId', 'firstName lastName email employeeId');
  }

  async delete(id: string): Promise<ReimbursementDocument | null> {
    return Reimbursement.findByIdAndDelete(id);
  }

  async findAll(query: {
    companyId: string;
    employeeId?: string;
    category?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<{ claims: ReimbursementDocument[]; total: number }> {
    const filter: any = { companyId: query.companyId };
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
