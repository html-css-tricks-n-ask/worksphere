import { jest } from '@jest/globals';
import { leaveRepository } from '../src/repositories/leave.repository.js';
import Leave from '../src/models/Leave.js';

describe('LeaveRepository Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create new leave request successfully', async () => {
    const mockLeave = {
      employeeId: 'emp_123',
      companyId: 'comp_123',
      leaveType: 'Casual Leave',
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-12'),
      totalDays: 3,
      reason: 'Vacation leave request',
      status: 'Pending',
    };

    const spyCreate = jest.spyOn(Leave, 'create').mockImplementation((async (payload: any) => {
      return { ...mockLeave, ...payload } as any;
    }) as any);

    const result = await leaveRepository.create(mockLeave as any);

    expect(result.leaveType).toBe('Casual Leave');
    expect(result.totalDays).toBe(3);
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should identify overlapping leave applications correctly', async () => {
    const spyFindOne = jest.spyOn(Leave, 'findOne').mockResolvedValue({ _id: 'leave_123' } as any);

    const overlap = await leaveRepository.hasOverlap(
      'emp_123',
      new Date('2026-05-10'),
      new Date('2026-05-12')
    );

    expect(overlap).toBe(true);
    expect(spyFindOne).toHaveBeenCalled();
  });

  it('should correctly aggregate leave balances and quotas', async () => {
    jest.spyOn(Leave, 'find').mockResolvedValue([
      { leaveType: 'Casual Leave', totalDays: 3, status: 'Approved' },
      { leaveType: 'Sick Leave', totalDays: 2, status: 'Approved' },
    ] as any);

    const balances = await leaveRepository.getBalances('emp_123', 'comp_123');

    expect(balances.casual.quota).toBe(12);
    expect(balances.casual.used).toBe(3);
    expect(balances.casual.remaining).toBe(9);

    expect(balances.sick.quota).toBe(10);
    expect(balances.sick.used).toBe(2);
    expect(balances.sick.remaining).toBe(8);
  });
});
