 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { jest } from '@jest/globals';
import { companySettingsRepository } from '../src/repositories/companySettings.repository.js';
import CompanySettings from '../src/models/CompanySettings.js';

describe('CompanySettings Repository Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should find settings by company ID', async () => {
    const mockSettings = {
      companyId: 'company_123',
      currency: 'USD',
      weekendDays: [0, 6],
    };

    const spyFindOne = jest.spyOn(CompanySettings, 'findOne').mockResolvedValue(mockSettings );

    const result = await companySettingsRepository.findByCompanyId('company_123');

    expect(_optionalChain([result, 'optionalAccess', _ => _.currency])).toBe('USD');
    expect(spyFindOne).toHaveBeenCalled();
  });
});
