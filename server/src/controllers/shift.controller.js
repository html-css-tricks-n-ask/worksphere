

import { shiftRepository } from '../repositories/shift.repository.js';
import { createShiftSchema, updateShiftSchema } from '../validators/shift.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createShift = asyncHandler(async (req, res) => {
  const parsed = createShiftSchema.parse(req.body);

  const existing = await shiftRepository.findByName(parsed.name);
  if (existing) {
    throw new ApiError(400, `A shift named "${parsed.name}" already exists in your organization.`);
  }

  const shift = await shiftRepository.create(parsed );
  res.status(201).json(new ApiResponse(201, shift, 'Shift created successfully.'));
});

export const getShifts = asyncHandler(async (req, res) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;

  const result = await shiftRepository.findAll({ page, limit, search });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        shifts: result.shifts,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Shifts fetched successfully.'
    )
  );
});

export const getShiftById = asyncHandler(async (req, res) => {
  const shift = await shiftRepository.findById(req.params.id);
  if (!shift) {
    throw new ApiError(404, 'Shift not found.');
  }
  res.status(200).json(new ApiResponse(200, shift, 'Shift fetched successfully.'));
});

export const updateShift = asyncHandler(async (req, res) => {
  const parsed = updateShiftSchema.parse(req.body);

  if (parsed.name) {
    const existing = await shiftRepository.findByName(parsed.name);
    if (existing && existing.id !== req.params.id) {
      throw new ApiError(400, `A shift named "${parsed.name}" already exists in your organization.`);
    }
  }

  const shift = await shiftRepository.update(req.params.id, parsed );
  if (!shift) {
    throw new ApiError(404, 'Shift not found.');
  }

  res.status(200).json(new ApiResponse(200, shift, 'Shift updated successfully.'));
});

export const deleteShift = asyncHandler(async (req, res) => {
  const shift = await shiftRepository.delete(req.params.id);
  if (!shift) {
    throw new ApiError(404, 'Shift not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Shift deleted successfully.'));
});
