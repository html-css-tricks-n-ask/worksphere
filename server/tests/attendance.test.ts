import { jest } from '@jest/globals';
import { attendanceRepository } from '../src/repositories/attendance.repository.js';
import Attendance from '../src/models/Attendance.js';
import Employee from '../src/models/Employee.js';

describe('AttendanceRepository Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create check-in attendance record successfully', async () => {
    const mockAttendance = {
      employeeId: 'emp_123',
      companyId: 'comp_123',
      checkIn: new Date(),
      status: 'Present',
      attendanceType: 'Web',
    };

    const spyCreate = jest.spyOn(Attendance, 'create').mockImplementation((async (payload: any) => {
      return { ...mockAttendance, ...payload } as any;
    }) as any);

    const result = await attendanceRepository.create(mockAttendance as any);

    expect(result.status).toBe('Present');
    expect(result.attendanceType).toBe('Web');
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should find employee today log', async () => {
    const mockAttendance = {
      _id: 'att_123',
      employeeId: 'emp_123',
      companyId: 'comp_123',
      checkIn: new Date(),
    };

    const spyFindOne = jest.spyOn(Attendance, 'findOne').mockResolvedValue(mockAttendance as any);

    const result = await attendanceRepository.findTodayLog('emp_123', 'comp_123');

    expect(result?._id).toBe('att_123');
    expect(spyFindOne).toHaveBeenCalled();
  });

  it('should calculate today dashboard statistics', async () => {
    jest.spyOn(Employee, 'countDocuments').mockResolvedValue(10);
    jest.spyOn(Attendance, 'find').mockResolvedValue([
      { status: 'Present', remarks: '' },
      { status: 'Leave', remarks: '' },
    ] as any);

    const stats = await attendanceRepository.getTodayStats('comp_123');

    expect(stats.present).toBe(1);
    expect(stats.onLeave).toBe(1);
    expect(stats.absent).toBe(8);
  });
});
