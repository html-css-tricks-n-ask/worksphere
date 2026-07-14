

import { attendanceRepository } from '../repositories/attendance.repository.js';
import { checkInSchema, checkOutSchema, manualAttendanceSchema } from '../validators/attendance.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notificationService } from '../services/notification.service.js';
import Employee from '../models/Employee.js';

export const checkIn = asyncHandler(async (req, res) => {
  const parsed = checkInSchema.parse(req.body);
  const { companyId } = req.user;

  const emp = req.employee;
  const employeeId = emp._id.toString();

  // Prevent double check-in on same day
  const existing = await attendanceRepository.findTodayLog(employeeId, companyId.toString());
  if (existing && existing.checkIn) {
    throw new ApiError(409, 'You have already checked in today. Please check out first.');
  }

  const attendance = await attendanceRepository.create({
    employeeId: employeeId ,
    companyId: companyId ,
    checkIn: new Date(),
    status: 'Present',
    ...parsed,
  });

  notificationService.send({
    toEmail: req.user.email || emp.email,
    toName: req.user.firstName || emp.firstName || 'Team Member',
    event: 'CHECKIN_SUCCESS',
  });

  res.status(201).json(new ApiResponse(201, attendance, 'Checked in successfully.'));
});

export const checkOut = asyncHandler(async (req, res) => {
  const parsed = checkOutSchema.parse(req.body);
  const { companyId } = req.user;

  const emp = req.employee;
  const employeeId = emp._id.toString();

  const existing = await attendanceRepository.findTodayLog(employeeId, companyId.toString());
  if (!existing || !existing.checkIn) {
    throw new ApiError(404, 'No check-in record found for today. Please check in first.');
  }
  if (existing.checkOut) {
    throw new ApiError(409, 'You have already checked out today.');
  }

  const checkOutTime = new Date();
  const checkInTime = new Date(existing.checkIn);
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  const breakHours = parseFloat(((existing.breakHours || 0)).toFixed(2));
  const overtimeHours = Math.max(0, parseFloat((totalHours - 8).toFixed(2)));

  const updated = await attendanceRepository.update(existing._id.toString(), {
    checkOut: checkOutTime,
    totalHours,
    breakHours,
    overtimeHours,
    ...parsed,
  });

  notificationService.send({
    toEmail: req.user.email || emp.email,
    toName: req.user.firstName || emp.firstName || 'Team Member',
    event: 'CHECKOUT_SUCCESS',
  });

  res.status(200).json(new ApiResponse(200, updated, 'Checked out successfully.'));
});

export const manualAttendance = asyncHandler(async (req, res) => {
  const parsed = manualAttendanceSchema.parse(req.body);

  const checkInTime = new Date(parsed.checkIn);
  const checkOutTime = parsed.checkOut ? new Date(parsed.checkOut) : undefined;
  let totalHours = 0;
  let overtimeHours = 0;

  if (checkOutTime) {
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    overtimeHours = Math.max(0, parseFloat((totalHours - 8).toFixed(2)));
  }

  const attendance = await attendanceRepository.create({
    employeeId: parsed.employeeId ,
    companyId: req.user.companyId ,
    checkIn: checkInTime,
    checkOut: checkOutTime,
    totalHours,
    overtimeHours,
    breakHours: 0,
    status: parsed.status,
    attendanceType: parsed.attendanceType,
    remarks: parsed.remarks,
    location: parsed.location,
  });

  res.status(201).json(new ApiResponse(201, attendance, 'Manual attendance recorded successfully.'));
});

export const getAttendanceLogs = asyncHandler(async (req, res) => {
  const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 30;

  const result = await attendanceRepository.findAll({
    employeeId,
    companyId: req.user.companyId.toString(),
    status,
    startDate,
    endDate,
    page,
    limit,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        logs: result.logs,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Attendance logs fetched successfully.'
    )
  );
});

export const getAttendanceStats = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId.toString();
  const [today, trends] = await Promise.all([
    attendanceRepository.getTodayStats(companyId),
    attendanceRepository.getTrendStats(companyId),
  ]);

  res.status(200).json(new ApiResponse(200, { today, trends }, 'Attendance stats fetched successfully.'));
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const employeeId = emp._id.toString();
  const companyId = emp.companyId.toString();

  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 30;
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

  const result = await attendanceRepository.findAll({
    employeeId: employeeId.toString(),
    companyId: companyId.toString(),
    startDate,
    endDate,
    page,
    limit,
  });

  const todayLog = await attendanceRepository.findTodayLog(employeeId.toString(), companyId.toString());

  res.status(200).json(
    new ApiResponse(
      200,
      {
        logs: result.logs,
        todayLog,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Your attendance fetched successfully.'
    )
  );
});
