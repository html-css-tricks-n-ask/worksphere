import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { reimbursementRepository } from '../repositories/reimbursement.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import {
  createReimbursementSchema,
  updateReimbursementSchema,
  approveReimbursementSchema,
} from '../validators/reimbursement.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Employee from '../models/Employee.js';
import { Types } from 'mongoose';

export const createReimbursement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createReimbursementSchema.parse(req.body);
  const { userId, companyId } = req.user!;

  // Resolve matching employee profile
  const emp = await Employee.findOne({ userId, companyId });
  if (!emp) {
    throw new ApiError(400, 'Employee profile not linked to your account.');
  }

  const claim = await reimbursementRepository.create({
    ...parsed,
    employeeId: emp._id as any,
    companyId: new Types.ObjectId(companyId),
    status: 'Pending',
  } as any);

  res.status(201).json(new ApiResponse(201, claim, 'Expense reimbursement claim submitted.'));
});

export const getReimbursements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, userId, role } = req.user!;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const category = req.query.category ? String(req.query.category) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;

  // If role is basic Employee, only return their own claims
  let employeeId;
  if (role === 'Employee') {
    const emp = await Employee.findOne({ userId, companyId });
    if (emp) {
      employeeId = emp._id.toString();
    }
  }

  const result = await reimbursementRepository.findAll({
    companyId: companyId.toString(),
    employeeId,
    category,
    status,
    page,
    limit,
  });

  res.status(200).json(new ApiResponse(200, result, 'Reimbursements fetched successfully.'));
});

export const getReimbursementById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const claim = await reimbursementRepository.findById(req.params.id);
  if (!claim) {
    throw new ApiError(404, 'Reimbursement claim not found.');
  }
  res.status(200).json(new ApiResponse(200, claim, 'Reimbursement claim fetched.'));
});

export const approveReimbursement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = approveReimbursementSchema.parse(req.body);
  const claim = await reimbursementRepository.findById(req.params.id);
  if (!claim) {
    throw new ApiError(404, 'Reimbursement claim not found.');
  }

  const userId = new Types.ObjectId(req.user!.userId);
  const updateData: any = {};

  if (parsed.role === 'Manager') {
    updateData.managerApprovedBy = userId;
    updateData.managerApprovedAt = new Date();
    if (parsed.status === 'Rejected') {
      updateData.status = 'Rejected';
    }
  } else if (parsed.role === 'HR') {
    updateData.hrApprovedBy = userId;
    updateData.hrApprovedAt = new Date();
    if (parsed.status === 'Approved') {
      updateData.status = 'Approved'; // Final approval mark
    } else {
      updateData.status = 'Rejected';
    }
  }

  const updated = await reimbursementRepository.update(req.params.id, updateData);
  res.status(200).json(new ApiResponse(200, updated, 'Expense claim status updated.'));
});

export const deleteReimbursement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const claim = await reimbursementRepository.findById(req.params.id);
  if (!claim) {
    throw new ApiError(404, 'Reimbursement claim not found.');
  }
  if (claim.status !== 'Pending') {
    throw new ApiError(400, 'Cannot delete a processed expense claim.');
  }

  await reimbursementRepository.delete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Expense claim deleted.'));
});
