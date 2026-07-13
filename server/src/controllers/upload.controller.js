

import { uploadService } from '../services/upload.service.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import { companyRepository } from '../repositories/company.repository.js';

export const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded.');
  }

  const result = await uploadService.uploadCompanyLogo(req.file.buffer);
  
  // Save logo to Company document immediately to prevent refresh losses
  await companyRepository.update(req.user.companyId.toString(), {
    logo: result.url,
  });

  res.status(200).json(new ApiResponse(200, result, 'Company logo uploaded successfully.'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded.');
  }

  const result = await uploadService.uploadAvatar(req.file.buffer);
  res.status(200).json(new ApiResponse(200, result, 'Profile avatar uploaded successfully.'));
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  if (!publicId) {
    throw new ApiError(400, 'Public ID is required to delete asset.');
  }

  const success = await uploadService.deleteFile(publicId);
  if (!success) {
    throw new ApiError(500, 'Asset deletion failed.');
  }

  res.status(200).json(new ApiResponse(200, null, 'Asset deleted successfully.'));
});
