import { jest } from '@jest/globals';
import { holidayRepository } from '../src/repositories/holiday.repository.js';
import Holiday from '../src/models/Holiday.js';

describe('HolidayRepository Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a new holiday', async () => {
    const mockHoliday = {
      name: 'New Year',
      date: new Date('2026-01-01'),
      type: 'National',
      companyId: 'company_123',
    };

    const spyCreate = jest.spyOn(Holiday, 'create').mockImplementation((async (payload: any) => {
      return { ...mockHoliday, ...payload } as any;
    }) as any);

    const result = await holidayRepository.create(mockHoliday as any);

    expect(result.name).toBe('New Year');
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should find holiday by date range', async () => {
    const mockHoliday = {
      name: 'Independence Day',
      date: new Date('2026-08-15'),
      type: 'National',
    };

    const spyFindOne = jest.spyOn(Holiday, 'findOne').mockResolvedValue(mockHoliday as any);

    const result = await holidayRepository.findByDate(new Date('2026-08-15'), 'company_123');

    expect(result?.name).toBe('Independence Day');
    expect(spyFindOne).toHaveBeenCalled();
  });
});
