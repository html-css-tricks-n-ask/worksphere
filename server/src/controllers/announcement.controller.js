 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { announcementRepository } from '../repositories/announcement.repository.js';

import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Employee from '../models/Employee.js';
import { Types } from 'mongoose';

export const createAnnouncement = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const { title, content, pinned, targetDepartmentId, expiryDate } = req.body;

  if (!title || !content) {
    throw new ApiError(400, 'Title and content are required.');
  }

  const announcement = await announcementRepository.create({
    title,
    content,
    pinned: !!pinned,
    targetDepartmentId: targetDepartmentId ? new Types.ObjectId(targetDepartmentId) : undefined,
    companyId: new Types.ObjectId(companyId),
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
  } );

  res.status(201).json(new ApiResponse(201, announcement, 'Company bulletin announcement published.'));
});

export const getAnnouncements = asyncHandler(async (req, res) => {
  const { companyId, userId, role } = req.user;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

  // Resolve department restriction if basic employee
  let departmentId;
  if (role === 'Employee') {
    const emp = await Employee.findOne({ userId, companyId });
    if (emp && _optionalChain([emp, 'access', _ => _.professionalInfo, 'optionalAccess', _2 => _2.departmentId])) {
      departmentId = emp.professionalInfo.departmentId.toString();
    }
  }

  const result = await announcementRepository.findAll({
    companyId: companyId.toString(),
    departmentId,
    page,
    limit,
  });

  res.status(200).json(new ApiResponse(200, result, 'Company announcements bulletin fetched.'));
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await announcementRepository.findById(req.params.id);
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found.');
  }
  res.status(200).json(new ApiResponse(200, announcement, 'Announcement fetched.'));
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementRepository.update(req.params.id, req.body);
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found.');
  }
  res.status(200).json(new ApiResponse(200, announcement, 'Announcement updated successfully.'));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementRepository.delete(req.params.id);
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Announcement deleted successfully.'));
});
