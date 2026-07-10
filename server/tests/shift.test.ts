import { jest } from '@jest/globals';
import { shiftRepository } from '../src/repositories/shift.repository.js';
import Shift from '../src/models/Shift.js';

describe('ShiftRepository Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully create a new shift config', async () => {
    const mockShift = {
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      workingHours: 9,
      companyId: 'company_123',
    };

    const spyCreate = jest.spyOn(Shift, 'create').mockImplementation((async (payload: any) => {
      return { ...mockShift, ...payload } as any;
    }) as any);

    const result = await shiftRepository.create(mockShift as any);

    expect(result.name).toBe('General Shift');
    expect(result.startTime).toBe('09:00');
    expect(result.workingHours).toBe(9);
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should find shift by ID', async () => {
    const mockShift = {
      _id: 'shift_123',
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      workingHours: 8,
    };

    const spyFindById = jest.spyOn(Shift, 'findById').mockResolvedValue(mockShift as any);

    const result = await shiftRepository.findById('shift_123');

    expect(result?.name).toBe('Night Shift');
    expect(spyFindById).toHaveBeenCalledWith('shift_123');
  });

  it('should update shift config', async () => {
    const mockShift = {
      _id: 'shift_123',
      name: 'Flexible Shift',
      workingHours: 8,
    };

    const spyUpdate = jest.spyOn(Shift, 'findByIdAndUpdate').mockResolvedValue(mockShift as any);

    const result = await shiftRepository.update('shift_123', { workingHours: 8 } as any);

    expect(result?.workingHours).toBe(8);
    expect(spyUpdate).toHaveBeenCalled();
  });
});
