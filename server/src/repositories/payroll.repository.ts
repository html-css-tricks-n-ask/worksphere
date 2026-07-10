import Payroll, { PayrollDocument } from '../models/Payroll.js';

class PayrollRepository {
  async create(payload: Partial<PayrollDocument>): Promise<PayrollDocument> {
    return Payroll.create(payload);
  }

  async findById(id: string): Promise<PayrollDocument | null> {
    return Payroll.findById(id).populate('employeeId', 'firstName lastName email employeeId professionalInfo');
  }

  async update(id: string, payload: Partial<PayrollDocument>): Promise<PayrollDocument | null> {
    return Payroll.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }

  async delete(id: string): Promise<PayrollDocument | null> {
    return Payroll.findByIdAndDelete(id);
  }

  async findByEmployeeMonth(employeeId: string, month: string, companyId: string): Promise<PayrollDocument | null> {
    return Payroll.findOne({ employeeId, month, companyId });
  }

  async findAll(query: {
    companyId: string;
    employeeId?: string;
    month?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<{ payrolls: PayrollDocument[]; total: number }> {
    const filter: any = { companyId: query.companyId };
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.month) filter.month = query.month;
    if (query.status) filter.status = query.status;

    const skip = (query.page - 1) * query.limit;

    const [payrolls, total] = await Promise.all([
      Payroll.find(filter)
        .populate('employeeId', 'firstName lastName email employeeId')
        .skip(skip)
        .limit(query.limit)
        .sort({ month: -1 }),
      Payroll.countDocuments(filter),
    ]);

    return { payrolls, total };
  }

  // Dashboard Stats Calculations for Payroll
  async getStats(companyId: string): Promise<{
    processedCount: number;
    pendingCount: number;
    totalPaidSalary: number;
    totalDeductions: number;
    totalBonuses: number;
  }> {
    const records = await Payroll.find({ companyId });

    const stats = {
      processedCount: records.filter(r => r.status === 'Locked' || r.status === 'Completed').length,
      pendingCount: records.filter(r => r.status === 'Draft' || r.status === 'Processing').length,
      totalPaidSalary: 0,
      totalDeductions: 0,
      totalBonuses: 0,
    };

    records.forEach(r => {
      if (r.status === 'Locked' || r.status === 'Completed') {
        stats.totalPaidSalary += r.netSalary || 0;
        stats.totalDeductions += r.totalDeductions || 0;
        stats.totalBonuses += (r.bonus || 0) + (r.incentive || 0);
      }
    });

    return stats;
  }
}

export const payrollRepository = new PayrollRepository();
export default payrollRepository;
