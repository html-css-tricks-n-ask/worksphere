 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { leaveRepository } from '../repositories/leave.repository.js';
import { holidayRepository } from '../repositories/holiday.repository.js';
import { applyLeaveSchema, updateLeaveStatusSchema } from '../validators/leave.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notificationService } from '../services/notification.service.js';
import Employee from '../models/Employee.js';

export const applyLeave = asyncHandler(async (req, res) => {
  const parsed = applyLeaveSchema.parse(req.body);
  const { email, firstName } = req.user;

  const emp = req.employee;
  const employeeId = emp._id.toString();
  const companyId = emp.companyId.toString();
  const empEmail = email || emp.email;
  const empName = firstName || emp.firstName || 'Team Member';

  const startDate = new Date(parsed.startDate);
  const endDate = new Date(parsed.endDate);

  // Check if dates fall on a holiday
  const isHoliday = await holidayRepository.findByDate(startDate, companyId.toString());
  if (isHoliday) {
    throw new ApiError(400, `The selected date (${startDate.toDateString()}) is a holiday: "${isHoliday.name}". Please choose a different date.`);
  }

  // Check for overlapping approved/pending leaves
  const hasOverlap = await leaveRepository.hasOverlap(employeeId.toString(), startDate, endDate);
  if (hasOverlap) {
    throw new ApiError(409, 'You already have an approved or pending leave request that overlaps with the selected dates.');
  }

  // Calculate working days (Monday–Friday)
  let totalDays = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) totalDays++;
    current.setDate(current.getDate() + 1);
  }

  const leave = await leaveRepository.create({
    employeeId: employeeId ,
    companyId: companyId ,
    leaveType: parsed.leaveType,
    startDate,
    endDate,
    totalDays,
    reason: parsed.reason,
    attachment: parsed.attachment,
    status: 'Pending',
  });

  notificationService.send({
    toEmail: empEmail,
    toName: empName,
    event: 'LEAVE_APPLIED',
    meta: {
      leaveType: parsed.leaveType,
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      totalDays,
    },
  });

  res.status(201).json(new ApiResponse(201, leave, 'Leave request submitted successfully.'));
});

export const getLeaves = asyncHandler(async (req, res) => {
  const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const leaveType = req.query.leaveType ? String(req.query.leaveType) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

  const result = await leaveRepository.findAll({
    companyId: req.user.companyId.toString(),
    employeeId,
    status,
    leaveType,
    page,
    limit,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        leaves: result.leaves,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Leave requests fetched successfully.'
    )
  );
});

export const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await leaveRepository.findById(req.params.id);
  if (!leave) {
    throw new ApiError(404, 'Leave request not found.');
  }
  res.status(200).json(new ApiResponse(200, leave, 'Leave request fetched successfully.'));
});

export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const parsed = updateLeaveStatusSchema.parse(req.body);

  const existing = await leaveRepository.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, 'Leave request not found.');
  }

  if (existing.status !== 'Pending') {
    throw new ApiError(400, `Cannot update a leave that is already "${existing.status}".`);
  }

  const updatedLeave = await leaveRepository.update(req.params.id, {
    status: parsed.status,
    approvedBy: req.user._id ,
    approvedAt: new Date(),
  });

  // Notify the employee
  const employee = existing.employeeId ;
  const employeeEmail = _optionalChain([employee, 'optionalAccess', _ => _.email]) || '';
  const employeeName = _optionalChain([employee, 'optionalAccess', _2 => _2.firstName]) || 'Team Member';

  if (employeeEmail) {
    notificationService.send({
      toEmail: employeeEmail,
      toName: employeeName,
      event: parsed.status === 'Approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      meta: {
        leaveType: existing.leaveType,
        startDate: existing.startDate.toDateString(),
        endDate: existing.endDate.toDateString(),
        totalDays: existing.totalDays,
      },
    });
  }

  res.status(200).json(new ApiResponse(200, updatedLeave, `Leave request ${parsed.status.toLowerCase()} successfully.`));
});

export const getMyLeaves = asyncHandler(async (req, res) => {
  const { companyId } = req.user;

  const emp = req.employee;
  const employeeId = emp._id.toString();

  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const status = req.query.status ? String(req.query.status) : undefined;

  const [result, balances] = await Promise.all([
    leaveRepository.findAll({
      employeeId: employeeId.toString(),
      companyId: companyId.toString(),
      status,
      page,
      limit,
    }),
    leaveRepository.getBalances(employeeId.toString(), companyId.toString()),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        leaves: result.leaves,
        balances,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Your leave requests fetched successfully.'
    )
  );
});

export const getLeaveBalances = asyncHandler(async (req, res) => {
  const { companyId } = req.user;

  const emp = req.employee;
  const employeeId = emp._id.toString();

  const balances = await leaveRepository.getBalances(employeeId.toString(), companyId.toString());
  res.status(200).json(new ApiResponse(200, balances, 'Leave balances fetched successfully.'));
});
