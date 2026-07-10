import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { announcementRepository } from '../repositories/announcement.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Employee from '../models/Employee.js';
import { Types } from 'mongoose';

export const createAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
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
  } as any);

  res.status(201).json(new ApiResponse(201, announcement, 'Company bulletin announcement published.'));
});

export const getAnnouncements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, userId, role } = req.user!;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

  // Resolve department restriction if basic employee
  let departmentId;
  if (role === 'Employee') {
    const emp = await Employee.findOne({ userId, companyId });
    if (emp && emp.professionalInfo?.departmentId) {
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

export const getAnnouncementById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const announcement = await announcementRepository.findById(req.params.id);
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found.');
  }
  res.status(200).json(new ApiResponse(200, announcement, 'Announcement fetched.'));
});

export const updateAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const announcement = await announcementRepository.update(req.params.id, req.body);
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found.');
  }
  res.status(200).json(new ApiResponse(200, announcement, 'Announcement updated successfully.'));
});

export const deleteAnnouncement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const announcement = await announcementRepository.delete(req.params.id);
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Announcement deleted successfully.'));
});
