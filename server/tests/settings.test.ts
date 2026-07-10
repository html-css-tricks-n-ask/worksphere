import { jest } from '@jest/globals';
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

    const spyFindOne = jest.spyOn(CompanySettings, 'findOne').mockResolvedValue(mockSettings as any);

    const result = await companySettingsRepository.findByCompanyId('company_123');

    expect(result?.currency).toBe('USD');
    expect(spyFindOne).toHaveBeenCalled();
  });
});
