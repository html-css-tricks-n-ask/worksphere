 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { companyService } from '../services/company.service.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateCompanySchema } from '../validators/company.validator.js';

export const getProfile = asyncHandler(async (req, res) => {
  if (!_optionalChain([req, 'access', _ => _.user, 'optionalAccess', _2 => _2.companyId])) {
    throw new ApiError(401, 'Tenant context not established.');
  }

  const company = await companyService.getCompanyProfile(req.user.companyId);
  res.status(200).json(new ApiResponse(200, company, 'Company profile fetched successfully.'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!_optionalChain([req, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.companyId])) {
    throw new ApiError(401, 'Tenant context not established.');
  }

  const parsed = updateCompanySchema.parse(req.body);
  const updatedCompany = await companyService.updateCompanyProfile(req.user.companyId, parsed);
  
  res.status(200).json(new ApiResponse(200, updatedCompany, 'Company profile updated successfully.'));
});
