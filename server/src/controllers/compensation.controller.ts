import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { compensationRepository } from '../repositories/compensation.repository.js';
import { createCompensationSchema } from '../validators/payroll.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Types } from 'mongoose';

export const createCompensation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createCompensationSchema.parse(req.body);
  const companyId = req.user!.companyId;

  const record = await compensationRepository.create({
    ...parsed,
    employeeId: new Types.ObjectId(parsed.employeeId),
    companyId: new Types.ObjectId(companyId),
  } as any);

  res.status(201).json(new ApiResponse(201, record, 'Compensation record added successfully.'));
});

export const getCompensationHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const history = await compensationRepository.findHistory(req.params.employeeId, companyId.toString());
  res.status(200).json(new ApiResponse(200, history, 'Compensation revision logs fetched.'));
});

export const getCompensations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;

  const result = await compensationRepository.findAll({
    companyId: companyId.toString(),
    employeeId,
    page,
    limit,
  });

  res.status(200).json(new ApiResponse(200, result, 'Compensation revision logs fetched.'));
});
