 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { jest } from '@jest/globals';
import { employeeRepository } from '../src/repositories/employee.repository.js';
import Employee from '../src/models/Employee.js';

describe('EmployeeRepository Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully create employee profile record', async () => {
    const mockEmp = {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@worksphere.com',
      employeeId: 'EMP005',
      id: 'emp_999',
    };

    const spyCreate = jest.spyOn(Employee, 'create').mockImplementation((async (payload) => {
      return { ...mockEmp, ...payload } ;
    }) );

    const result = await employeeRepository.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@worksphere.com',
      employeeId: 'EMP005',
    } );

    expect(result.firstName).toBe('Alice');
    expect(result.employeeId).toBe('EMP005');
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should find employee by work email address', async () => {
    const mockEmp = {
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@worksphere.com',
      employeeId: 'EMP006',
    };

    const spyFindOne = jest.spyOn(Employee, 'findOne').mockResolvedValue(mockEmp );

    const result = await employeeRepository.findByEmail('bob.brown@worksphere.com');

    expect(_optionalChain([result, 'optionalAccess', _ => _.employeeId])).toBe('EMP006');
    expect(spyFindOne).toHaveBeenCalled();
  });

  it('should find employee by ID resolving population chain', async () => {
    const mockEmp = {
      id: 'emp_123',
      firstName: 'Bob',
      lastName: 'Brown',
    };

    const mockQuery = {
      populate: (jest.fn() ).mockImplementation(() => mockQuery),
      then: (jest.fn() ).mockImplementation((onFulfilled) => {
        return Promise.resolve(mockEmp).then(onFulfilled);
      }),
    };

    const spyFindById = jest.spyOn(Employee, 'findById').mockReturnValue(mockQuery );

    const result = await employeeRepository.findById('emp_123');

    expect(_optionalChain([result, 'optionalAccess', _2 => _2.firstName])).toBe('Bob');
    expect(spyFindById).toHaveBeenCalledWith('emp_123');
  });
});
