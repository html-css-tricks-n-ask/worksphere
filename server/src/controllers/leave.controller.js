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

  // Resolve initial approval stage based on employee hierarchy
  let initialStage = 'HR Manager';
  if (emp.professionalInfo && emp.professionalInfo.teamLeadId) {
    initialStage = 'Team Lead';
  } else if (emp.professionalInfo && emp.professionalInfo.managerId) {
    initialStage = 'Department Manager';
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
    currentStage: initialStage,
    approvals: []
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
  const approver = req.employee;

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    throw new ApiError(404, 'Leave request not found.');
  }

  if (leave.status !== 'Pending') {
    throw new ApiError(400, `Cannot update a leave that is already "${leave.status}".`);
  }

  const submitter = await Employee.findById(leave.employeeId);
  if (!submitter) {
    throw new ApiError(404, 'Submitter profile not found.');
  }

  const comments = parsed.comments || '';

  // Process Stage Actions
  if (leave.currentStage === 'Team Lead') {
    if (!submitter.professionalInfo?.teamLeadId || submitter.professionalInfo.teamLeadId.toString() !== approver._id.toString()) {
      throw new ApiError(403, 'You are not the designated Team Lead for this request.');
    }
    
    if (parsed.status === 'Rejected') {
      leave.status = 'Rejected';
    } else {
      // Progress stage
      leave.currentStage = submitter.professionalInfo.managerId ? 'Department Manager' : 'HR Manager';
    }
    leave.approvals.push({
      approverId: approver._id,
      role: 'Team Lead',
      status: parsed.status,
      comments,
      actionedAt: new Date()
    });
  } else if (leave.currentStage === 'Department Manager') {
    if (!submitter.professionalInfo?.managerId || submitter.professionalInfo.managerId.toString() !== approver._id.toString()) {
      throw new ApiError(403, 'You are not the designated Department Manager for this request.');
    }

    if (parsed.status === 'Rejected') {
      leave.status = 'Rejected';
    } else {
      leave.currentStage = 'HR Manager';
    }
    leave.approvals.push({
      approverId: approver._id,
      role: 'Department Manager',
      status: parsed.status,
      comments,
      actionedAt: new Date()
    });
  } else if (leave.currentStage === 'HR Manager') {
    if (req.user.role !== 'HR' && req.user.role !== 'Company Admin') {
      throw new ApiError(403, 'Only HR Managers or Company Admins can perform final approval.');
    }

    leave.status = parsed.status; // Approved or Rejected
    leave.approvedBy = req.user._id || req.user.userId;
    leave.approvedAt = new Date();
    leave.approvals.push({
      approverId: approver._id,
      role: 'HR Manager',
      status: parsed.status,
      comments,
      actionedAt: new Date()
    });
  }

  await leave.save();

  // Notify the employee
  const employeeEmail = submitter.email || '';
  const employeeName = submitter.firstName || 'Team Member';

  if (employeeEmail) {
    notificationService.send({
      toEmail: employeeEmail,
      toName: employeeName,
      event: leave.status === 'Approved' ? 'LEAVE_APPROVED' : leave.status === 'Rejected' ? 'LEAVE_REJECTED' : 'LEAVE_APPLIED',
      meta: {
        leaveType: leave.leaveType,
        startDate: leave.startDate.toDateString(),
        endDate: leave.endDate.toDateString(),
        totalDays: leave.totalDays,
      },
    });
  }

  res.status(200).json(new ApiResponse(200, leave, `Leave request ${parsed.status.toLowerCase()} successfully.`));
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

export const getPendingLeaves = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const emp = req.employee;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const skip = (page - 1) * limit;

  let filter = { status: 'Pending' };

  if (role === 'Super Admin') {
    // Super Admin sees all
  } else if (role === 'Company Admin' || role === 'HR') {
    filter.currentStage = 'HR Manager';
  } else {
    // Team Lead or Department Manager
    const supervised = await Employee.find({
      $or: [
        { 'professionalInfo.teamLeadId': emp._id },
        { 'professionalInfo.managerId': emp._id }
      ]
    });
    const leadEmps = supervised.filter(e => _optionalChain([e, 'access', _3 => _3.professionalInfo, 'optionalAccess', _4 => _4.teamLeadId, 'optionalAccess', _5 => _5.toString])() === emp._id.toString()).map(e => e._id);
    const mgrEmps = supervised.filter(e => _optionalChain([e, 'access', _6 => _6.professionalInfo, 'optionalAccess', _7 => _7.managerId, 'optionalAccess', _8 => _8.toString])() === emp._id.toString()).map(e => e._id);

    filter.$or = [
      { currentStage: 'Team Lead', employeeId: { $in: leadEmps } },
      { currentStage: 'Department Manager', employeeId: { $in: mgrEmps } }
    ];
  }

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('employeeId', 'firstName lastName employeeId email professionalInfo')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec(),
    Leave.countDocuments(filter).exec(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        leaves,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      },
      'Pending leave approvals fetched successfully.'
    )
  );
});
