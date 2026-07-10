import Leave, { LeaveDocument } from '../models/Leave.js';

class LeaveRepository {
  async create(payload: Partial<LeaveDocument>): Promise<LeaveDocument> {
    return Leave.create(payload);
  }

  async findById(id: string): Promise<LeaveDocument | null> {
    return Leave.findById(id)
      .populate('employeeId', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName email');
  }

  async update(id: string, payload: Partial<LeaveDocument>): Promise<LeaveDocument | null> {
    return Leave.findByIdAndUpdate(id, { $set: payload }, { new: true })
      .populate('employeeId', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName email');
  }

  async delete(id: string): Promise<LeaveDocument | null> {
    return Leave.findByIdAndDelete(id);
  }

  async hasOverlap(employeeId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const overlap = await Leave.findOne({
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });
    return !!overlap;
  }

  async findAll(query: {
    employeeId?: string;
    companyId?: string;
    status?: string;
    leaveType?: string;
    page: number;
    limit: number;
  }): Promise<{ leaves: LeaveDocument[]; total: number }> {
    const filter: any = {};
    if (query.companyId) filter.companyId = query.companyId;
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.status) filter.status = query.status;
    if (query.leaveType) filter.leaveType = query.leaveType;

    const skip = (query.page - 1) * query.limit;
    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate('employeeId', 'firstName lastName employeeId email')
        .populate('approvedBy', 'firstName lastName email')
        .skip(skip)
        .limit(query.limit)
        .sort({ startDate: -1 }),
      Leave.countDocuments(filter),
    ]);

    return { leaves, total };
  }

  // Quota and Balances calculator
  async getBalances(employeeId: string, companyId: string): Promise<{
    casual: { quota: number; used: number; remaining: number };
    sick: { quota: number; used: number; remaining: number };
    paid: { quota: number; used: number; remaining: number };
    wfh: { quota: number; used: number; remaining: number };
  }> {
    // Default allocations
    const allocations = {
      'Casual Leave': 12,
      'Sick Leave': 10,
      'Paid Leave': 15,
      'Earned Leave': 15,
      'Work From Home': 30,
    };

    const approvedLeaves = await Leave.find({
      employeeId,
      companyId,
      status: 'Approved',
    });

    const used = {
      casual: 0,
      sick: 0,
      paid: 0,
      wfh: 0,
    };

    approvedLeaves.forEach(leave => {
      const days = leave.totalDays || 1;
      if (leave.leaveType === 'Casual Leave') used.casual += days;
      else if (leave.leaveType === 'Sick Leave') used.sick += days;
      else if (leave.leaveType === 'Paid Leave' || leave.leaveType === 'Earned Leave') used.paid += days;
      else if (leave.leaveType === 'Work From Home') used.wfh += days;
    });

    return {
      casual: { quota: allocations['Casual Leave'], used: used.casual, remaining: Math.max(0, allocations['Casual Leave'] - used.casual) },
      sick: { quota: allocations['Sick Leave'], used: used.sick, remaining: Math.max(0, allocations['Sick Leave'] - used.sick) },
      paid: { quota: allocations['Paid Leave'], used: used.paid, remaining: Math.max(0, allocations['Paid Leave'] - used.paid) },
      wfh: { quota: allocations['Work From Home'], used: used.wfh, remaining: Math.max(0, allocations['Work From Home'] - used.wfh) },
    };
  }
}

export const leaveRepository = new LeaveRepository();
export default leaveRepository;
