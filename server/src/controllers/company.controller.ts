import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { companyService } from '../services/company.service.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateCompanySchema } from '../validators/company.validator.js';

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.companyId) {
    throw new ApiError(401, 'Tenant context not established.');
  }

  const company = await companyService.getCompanyProfile(req.user.companyId);
  res.status(200).json(new ApiResponse(200, company, 'Company profile fetched successfully.'));
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.companyId) {
    throw new ApiError(401, 'Tenant context not established.');
  }

  const parsed = updateCompanySchema.parse(req.body);
  const updatedCompany = await companyService.updateCompanyProfile(req.user.companyId, parsed);
  
  res.status(200).json(new ApiResponse(200, updatedCompany, 'Company profile updated successfully.'));
});
