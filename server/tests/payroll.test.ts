import { jest } from '@jest/globals';
import { salaryStructureRepository } from '../src/repositories/salaryStructure.repository.js';
import { payrollRepository } from '../src/repositories/payroll.repository.js';
import SalaryStructure from '../src/models/SalaryStructure.js';
import Payroll from '../src/models/Payroll.js';

describe('Payroll and SalaryStructure Repository Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create employee salary structure and compute net salary', async () => {
    const mockStructure = {
      employeeId: 'emp_123',
      basicSalary: 5000,
      hra: 1500,
      specialAllowance: 500,
      pf: 600,
      incomeTax: 400,
      netSalary: 6000,
    };

    const spyCreate = jest.spyOn(SalaryStructure, 'create').mockImplementation((async (payload: any) => {
      // simulate pre-save hook calculation
      const earnings = (payload.basicSalary || 0) + (payload.hra || 0) + (payload.specialAllowance || 0);
      const deductions = (payload.pf || 0) + (payload.incomeTax || 0);
      return { ...mockStructure, ...payload, netSalary: earnings - deductions } as any;
    }) as any);

    const result = await salaryStructureRepository.create({
      employeeId: 'emp_123' as any,
      basicSalary: 5000,
      hra: 1500,
      specialAllowance: 500,
      pf: 600,
      incomeTax: 400,
    } as any);

    expect(result.netSalary).toBe(6000);
    expect(spyCreate).toHaveBeenCalled();
  });

  it('should find payroll record by month and employeeId', async () => {
    const mockPayroll = {
      _id: 'payroll_abc',
      employeeId: 'emp_123',
      month: '2026-07',
      netSalary: 5000,
    };

    const spyFindOne = jest.spyOn(Payroll, 'findOne').mockResolvedValue(mockPayroll as any);

    const result = await payrollRepository.findByEmployeeMonth('emp_123', '2026-07', 'comp_123');

    expect(result?.netSalary).toBe(5000);
    expect(spyFindOne).toHaveBeenCalled();
  });
});
