

import { designationRepository } from '../repositories/designation.repository.js';
import { createDesignationSchema, updateDesignationSchema } from '../validators/designation.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createDesignation = asyncHandler(async (req, res) => {
  const parsed = createDesignationSchema.parse(req.body);

  const existing = await designationRepository.findByTitle(parsed.title);
  if (existing) {
    throw new ApiError(400, `A designation titled "${parsed.title}" already exists.`);
  }

  const designation = await designationRepository.create(parsed);
  res.status(201).json(new ApiResponse(201, designation, 'Designation created successfully.'));
});

export const getDesignations = asyncHandler(async (req, res) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const sortField = req.query.sortField ? String(req.query.sortField) : 'createdAt';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  const result = await designationRepository.findAll({
    search,
    page,
    limit,
    sortField,
    sortOrder,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        designations: result.designations,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Designations fetched successfully.'
    )
  );
});

export const getDesignationById = asyncHandler(async (req, res) => {
  const designation = await designationRepository.findById(req.params.id);
  if (!designation) {
    throw new ApiError(404, 'Designation not found.');
  }
  res.status(200).json(new ApiResponse(200, designation, 'Designation fetched successfully.'));
});

export const updateDesignation = asyncHandler(async (req, res) => {
  const parsed = updateDesignationSchema.parse(req.body);

  if (parsed.title) {
    const existing = await designationRepository.findByTitle(parsed.title);
    if (existing && existing.id !== req.params.id) {
      throw new ApiError(400, `A designation titled "${parsed.title}" already exists.`);
    }
  }

  const designation = await designationRepository.update(req.params.id, parsed);
  if (!designation) {
    throw new ApiError(404, 'Designation not found.');
  }

  res.status(200).json(new ApiResponse(200, designation, 'Designation updated successfully.'));
});

export const deleteDesignation = asyncHandler(async (req, res) => {
  const designation = await designationRepository.softDelete(req.params.id);
  if (!designation) {
    throw new ApiError(404, 'Designation not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Designation soft-deleted successfully.'));
});

export const restoreDesignation = asyncHandler(async (req, res) => {
  const designation = await designationRepository.restore(req.params.id);
  if (!designation) {
    throw new ApiError(404, 'Designation not found.');
  }
  res.status(200).json(new ApiResponse(200, designation, 'Designation restored successfully.'));
});
