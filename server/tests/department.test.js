 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { jest } from '@jest/globals';
import { departmentRepository } from '../src/repositories/department.repository.js';
import Department from '../src/models/Department.js';

describe('DepartmentRepository Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully create a new department record', async () => {
    const mockDept = {
      name: 'Engineering',
      description: 'Tech division',
      status: 'Active',
      id: 'dept_123',
    };

    const spyCreate = jest.spyOn(Department, 'create').mockImplementation((async (payload) => {
      return { ...mockDept, ...payload } ;
    }) );

    const result = await departmentRepository.create({
      name: 'Engineering',
      description: 'Tech division',
    } );

    expect(result.name).toBe('Engineering');
    expect(result.description).toBe('Tech division');
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should fetch department by ID', async () => {
    const mockDept = {
      id: 'dept_123',
      name: 'Sales',
      description: 'Outbound sales',
      status: 'Active',
    };

    const spyFindById = jest.spyOn(Department, 'findById').mockReturnValue({
      populate: (jest.fn() ).mockResolvedValue(mockDept )
    } );

    const result = await departmentRepository.findById('dept_123');

    expect(_optionalChain([result, 'optionalAccess', _ => _.name])).toBe('Sales');
    expect(spyFindById).toHaveBeenCalledWith('dept_123');
  });
});
