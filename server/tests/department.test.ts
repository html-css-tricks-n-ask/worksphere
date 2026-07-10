import { jest } from '@jest/globals';
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

    const spyCreate = jest.spyOn(Department, 'create').mockImplementation((async (payload: any) => {
      return { ...mockDept, ...payload } as any;
    }) as any);

    const result = await departmentRepository.create({
      name: 'Engineering',
      description: 'Tech division',
    } as any);

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
      populate: (jest.fn() as any).mockResolvedValue(mockDept as any)
    } as any);

    const result = await departmentRepository.findById('dept_123');

    expect(result?.name).toBe('Sales');
    expect(spyFindById).toHaveBeenCalledWith('dept_123');
  });
});
