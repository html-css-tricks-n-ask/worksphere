import { jest } from '@jest/globals';
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

    const spyCreate = jest.spyOn(Employee, 'create').mockImplementation((async (payload: any) => {
      return { ...mockEmp, ...payload } as any;
    }) as any);

    const result = await employeeRepository.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@worksphere.com',
      employeeId: 'EMP005',
    } as any);

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

    const spyFindOne = jest.spyOn(Employee, 'findOne').mockResolvedValue(mockEmp as any);

    const result = await employeeRepository.findByEmail('bob.brown@worksphere.com');

    expect(result?.employeeId).toBe('EMP006');
    expect(spyFindOne).toHaveBeenCalled();
  });

  it('should find employee by ID resolving population chain', async () => {
    const mockEmp = {
      id: 'emp_123',
      firstName: 'Bob',
      lastName: 'Brown',
    };

    const mockQuery: any = {
      populate: (jest.fn() as any).mockImplementation(() => mockQuery),
      then: (jest.fn() as any).mockImplementation((onFulfilled: any) => {
        return Promise.resolve(mockEmp).then(onFulfilled);
      }),
    };

    const spyFindById = jest.spyOn(Employee, 'findById').mockReturnValue(mockQuery as any);

    const result = await employeeRepository.findById('emp_123');

    expect(result?.firstName).toBe('Bob');
    expect(spyFindById).toHaveBeenCalledWith('emp_123');
  });
});
