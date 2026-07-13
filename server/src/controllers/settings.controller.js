

import { companySettingsRepository } from '../repositories/companySettings.repository.js';
import { ApiResponse, } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSettings = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  let settings = await companySettingsRepository.findByCompanyId(companyId.toString());
  if (!settings) {
    settings = await companySettingsRepository.createDefault(companyId.toString());
  }
  res.status(200).json(new ApiResponse(200, settings, 'Company settings configurations fetched.'));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const settings = await companySettingsRepository.update(companyId.toString(), req.body);
  res.status(200).json(new ApiResponse(200, settings, 'Company settings configurations updated.'));
});
