 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { jest } from '@jest/globals';
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

    const spyCreate = jest.spyOn(Reimbursement, 'create').mockImplementation((async (payload) => {
      return { ...mockClaim, ...payload } ;
    }) );

    const result = await reimbursementRepository.create({
      title: 'Travel Reimbursement',
      amount: 120.50,
      category: 'Travel' ,
      expenseDate: new Date(),
    } );

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
      populate: (jest.fn() ).mockResolvedValue(mockClaim)
    } );

    const result = await reimbursementRepository.update('claim_123', { status: 'Approved' } );

    expect(_optionalChain([result, 'optionalAccess', _ => _.status])).toBe('Approved');
    expect(spyUpdate).toHaveBeenCalled();
  });
});
