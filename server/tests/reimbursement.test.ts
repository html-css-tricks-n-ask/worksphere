import { jest } from '@jest/globals';
import { reimbursementRepository } from '../src/repositories/reimbursement.repository.js';
import Reimbursement from '../src/models/Reimbursement.js';

describe('Reimbursement Claims Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create new reimbursement claim successfully', async () => {
    const mockClaim = {
      title: 'Travel Reimbursement',
      amount: 120.50,
      category: 'Travel',
      status: 'Pending',
    };

    const spyCreate = jest.spyOn(Reimbursement, 'create').mockImplementation((async (payload: any) => {
      return { ...mockClaim, ...payload } as any;
    }) as any);

    const result = await reimbursementRepository.create({
      title: 'Travel Reimbursement',
      amount: 120.50,
      category: 'Travel' as any,
      expenseDate: new Date(),
    } as any);

    expect(result.amount).toBe(120.50);
    expect(result.status).toBe('Pending');
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should update approval status of claims', async () => {
    const mockClaim = {
      _id: 'claim_123',
      status: 'Approved',
    };

    const spyUpdate = jest.spyOn(Reimbursement, 'findByIdAndUpdate').mockReturnValue({
      populate: (jest.fn() as any).mockResolvedValue(mockClaim)
    } as any);

    const result = await reimbursementRepository.update('claim_123', { status: 'Approved' } as any);

    expect(result?.status).toBe('Approved');
    expect(spyUpdate).toHaveBeenCalled();
  });
});
