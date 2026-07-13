 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { salaryStructureRepository } from '../repositories/salaryStructure.repository.js';
import { payrollRepository } from '../repositories/payroll.repository.js';

import { companySettingsRepository } from '../repositories/companySettings.repository.js';
import {
  createSalaryStructureSchema,
  updateSalaryStructureSchema,
  processPayrollSchema,
} from '../validators/payroll.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { payslipService } from '../services/payslip.service.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import { Types } from 'mongoose';

// ─── SALARY STRUCTURES ───────────────────────────────────────────────────────
export const createSalaryStructure = asyncHandler(async (req, res) => {
  const parsed = createSalaryStructureSchema.parse(req.body);
  const companyId = req.user.companyId;

  // Prevent duplicate structures
  const existing = await salaryStructureRepository.findByEmployeeId(parsed.employeeId, companyId.toString());
  if (existing) {
    throw new ApiError(400, 'Active salary structure already configured for this employee.');
  }

  const structure = await salaryStructureRepository.create({
    ...parsed,
    employeeId: new Types.ObjectId(parsed.employeeId),
    companyId: new Types.ObjectId(companyId),
  } );

  res.status(201).json(new ApiResponse(201, structure, 'Salary structure created successfully.'));
});

export const getSalaryStructures = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

  const result = await salaryStructureRepository.findAll({
    companyId: companyId.toString(),
    page,
    limit,
  });

  res.status(200).json(new ApiResponse(200, result, 'Salary structures fetched successfully.'));
});

export const updateSalaryStructure = asyncHandler(async (req, res) => {
  const parsed = updateSalaryStructureSchema.parse(req.body);
  const structure = await salaryStructureRepository.update(req.params.id, parsed );
  if (!structure) {
    throw new ApiError(404, 'Salary structure not found.');
  }
  res.status(200).json(new ApiResponse(200, structure, 'Salary structure updated successfully.'));
});

export const deleteSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await salaryStructureRepository.delete(req.params.id);
  if (!structure) {
    throw new ApiError(404, 'Salary structure not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Salary structure deleted successfully.'));
});

// ─── PAYROLL PROCESSING ─────────────────────────────────────────────────────
export const processPayroll = asyncHandler(async (req, res) => {
  const parsed = processPayrollSchema.parse(req.body);
  const companyId = req.user.companyId;

  // 1. Get employees list
  let employees = [];
  if (parsed.employeeIds && parsed.employeeIds.length > 0) {
    employees = await Employee.find({
      _id: { $in: parsed.employeeIds },
      companyId,
      status: 'Active',
    });
  } else {
    employees = await Employee.find({
      companyId,
      status: 'Active',
    });
  }

  if (employees.length === 0) {
    throw new ApiError(404, 'No active employees found to process.');
  }

  // 2. Fetch company settings (for leave policies or weekends)
  const settings = await companySettingsRepository.findByCompanyId(companyId.toString());
  const maxDays = 30; // standard month reference

  const processedPayrolls = [];

  for (const emp of employees) {
    const employeeIdStr = emp._id.toString();

    // Check if payroll already processed and locked for this month
    const existing = await payrollRepository.findByEmployeeMonth(employeeIdStr, parsed.month, companyId.toString());
    if (existing && existing.status === 'Locked') {
      continue; // Skip locked records
    }

    // Lookup Salary structure
    const structure = await salaryStructureRepository.findByEmployeeId(employeeIdStr, companyId.toString());
    if (!structure) {
      continue; // Skip if no salary settings
    }

    // 3. Count leave deductions
    const startOfMonth = new Date(`${parsed.month}-01T00:00:00.000Z`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const leavesCount = await Leave.countDocuments({
      employeeId: emp._id,
      companyId,
      status: 'Approved',
      startDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const leaveDeductions = parseFloat((leavesCount * (structure.basicSalary / maxDays)).toFixed(2));
    const paidDays = Math.max(0, maxDays - leavesCount);

    // 4. Calculate overtime
    const logs = await Attendance.find({
      employeeId: emp._id,
      companyId,
      checkIn: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const overtimeHours = logs.reduce((sum, log) => sum + (log.overtimeHours || 0), 0);
    const overtimePay = parseFloat((overtimeHours * 15).toFixed(2)); // $15 flat rate per overtime hour

    const payrollData = {
      employeeId: emp._id,
      companyId: new Types.ObjectId(companyId),
      month: parsed.month,
      basicSalary: structure.basicSalary,
      hra: structure.hra,
      specialAllowance: structure.specialAllowance,
      conveyance: structure.conveyance,
      medicalAllowance: structure.medicalAllowance,
      bonus: structure.bonus,
      incentive: structure.incentive,
      overtimePay,
      pf: structure.pf,
      esi: structure.esi,
      professionalTax: structure.professionalTax,
      incomeTax: structure.incomeTax,
      otherDeductions: structure.otherDeductions,
      workingDays: maxDays,
      paidDays,
      leaveDeductions,
      status: 'Draft' ,
    };

    let payrollDoc;
    if (existing) {
      payrollDoc = await payrollRepository.update(existing._id.toString(), payrollData);
    } else {
      payrollDoc = await payrollRepository.create(payrollData);
    }
    processedPayrolls.push(payrollDoc);
  }

  res.status(201).json(new ApiResponse(201, processedPayrolls, 'Monthly payroll processed successfully.'));
});

export const getPayrolls = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const month = req.query.month ? String(req.query.month) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;

  const result = await payrollRepository.findAll({
    companyId: companyId.toString(),
    month,
    status,
    page,
    limit,
  });

  res.status(200).json(new ApiResponse(200, result, 'Payrolls fetched successfully.'));
});

export const getPayrollById = asyncHandler(async (req, res) => {
  const payroll = await payrollRepository.findById(req.params.id);
  if (!payroll) {
    throw new ApiError(404, 'Payroll not found.');
  }

  // Enforce company boundary
  if (payroll.companyId.toString() !== req.user.companyId.toString()) {
    throw new ApiError(403, 'Unauthorized.');
  }

  res.status(200).json(new ApiResponse(200, payroll, 'Payroll record fetched successfully.'));
});

export const updatePayrollStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const payroll = await payrollRepository.findById(req.params.id);
  if (!payroll) {
    throw new ApiError(404, 'Payroll not found.');
  }

  if (payroll.status === 'Locked' && status !== 'Locked') {
    throw new ApiError(400, 'Cannot unlock or modify a locked payroll.');
  }

  const payload = { status };
  if (status === 'Locked') {
    payload.lockedBy = new Types.ObjectId(req.user.userId);
    payload.lockedAt = new Date();
  }

  const updated = await payrollRepository.update(req.params.id, payload);
  res.status(200).json(new ApiResponse(200, updated, 'Payroll status updated successfully.'));
});

// ─── PAYSLIP OPERATIONS ─────────────────────────────────────────────────────
export const getPayslip = asyncHandler(async (req, res) => {
  const payroll = await payrollRepository.findById(req.params.id);
  if (!payroll) {
    throw new ApiError(404, 'Payroll record not found.');
  }

  const emp = payroll.employeeId;
  const html = payslipService.generateHtmlPayslip(
    payroll,
    `${emp.firstName} ${emp.lastName}`,
    emp.employeeId || 'EMP',
    _optionalChain([emp, 'access', _ => _.professionalInfo, 'optionalAccess', _2 => _2.departmentId, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]) || 'Operations',
    _optionalChain([emp, 'access', _5 => _5.professionalInfo, 'optionalAccess', _6 => _6.designationId, 'optionalAccess', _7 => _7.toString, 'call', _8 => _8()]) || 'Associate'
  );

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

export const emailPayslip = asyncHandler(async (req, res) => {
  const payroll = await payrollRepository.findById(req.params.id);
  if (!payroll) {
    throw new ApiError(404, 'Payroll record not found.');
  }

  const emp = payroll.employeeId;
  await payslipService.sendPayslipEmail(
    emp.email,
    `${emp.firstName} ${emp.lastName}`,
    payroll,
    emp.employeeId || 'EMP',
    _optionalChain([emp, 'access', _9 => _9.professionalInfo, 'optionalAccess', _10 => _10.departmentId, 'optionalAccess', _11 => _11.toString, 'call', _12 => _12()]) || 'Operations',
    _optionalChain([emp, 'access', _13 => _13.professionalInfo, 'optionalAccess', _14 => _14.designationId, 'optionalAccess', _15 => _15.toString, 'call', _16 => _16()]) || 'Associate'
  );

  res.status(200).json(new ApiResponse(200, null, 'Payslip email sent successfully.'));
});

// ─── PAYROLL WIDGETS & STATS ────────────────────────────────────────────────
export const getPayrollWidgets = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const stats = await payrollRepository.getStats(companyId.toString());

  // Aggregate monthly salary costs trend (mocking months for charts)
  const trends = [
    { month: 'Jan', cost: stats.totalPaidSalary * 0.9 },
    { month: 'Feb', cost: stats.totalPaidSalary * 0.95 },
    { month: 'Mar', cost: stats.totalPaidSalary },
  ];

  res.status(200).json(new ApiResponse(200, { stats, trends }, 'Payroll stats fetched successfully.'));
});
