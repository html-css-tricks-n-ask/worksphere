 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { jest } from '@jest/globals';
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

    const spyCreate = jest.spyOn(Holiday, 'create').mockImplementation((async (payload) => {
      return { ...mockHoliday, ...payload } ;
    }) );

    const result = await holidayRepository.create(mockHoliday );

    expect(result.name).toBe('New Year');
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should find holiday by date range', async () => {
    const mockHoliday = {
      name: 'Independence Day',
      date: new Date('2026-08-15'),
      type: 'National',
    };

    const spyFindOne = jest.spyOn(Holiday, 'findOne').mockResolvedValue(mockHoliday );

    const result = await holidayRepository.findByDate(new Date('2026-08-15'), 'company_123');

    expect(_optionalChain([result, 'optionalAccess', _ => _.name])).toBe('Independence Day');
    expect(spyFindOne).toHaveBeenCalled();
  });
});
