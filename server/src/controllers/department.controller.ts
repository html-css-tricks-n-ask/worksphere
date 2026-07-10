import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { departmentRepository } from '../repositories/department.repository.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createDepartmentSchema.parse(req.body);

  // Check unique department name per company
  const existing = await departmentRepository.findByName(parsed.name);
  if (existing) {
    throw new ApiError(400, `A department named "${parsed.name}" already exists in your organization.`);
  }

  const department = await departmentRepository.create(parsed as any);
  res.status(201).json(new ApiResponse(201, department, 'Department created successfully.'));
});

export const getDepartments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const sortField = req.query.sortField ? String(req.query.sortField) : 'createdAt';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  const result = await departmentRepository.findAll({
    search,
    status,
    page,
    limit,
    sortField,
    sortOrder,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        departments: result.departments,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Departments fetched successfully.'
    )
  );
});

export const getDepartmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const department = await departmentRepository.findById(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }
  res.status(200).json(new ApiResponse(200, department, 'Department fetched successfully.'));
});

export const updateDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = updateDepartmentSchema.parse(req.body);

  if (parsed.name) {
    const existing = await departmentRepository.findByName(parsed.name);
    if (existing && existing.id !== req.params.id) {
      throw new ApiError(400, `A department named "${parsed.name}" already exists in your organization.`);
    }
  }

  const department = await departmentRepository.update(req.params.id, parsed as any);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  res.status(200).json(new ApiResponse(200, department, 'Department updated successfully.'));
});

export const deleteDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const department = await departmentRepository.softDelete(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Department soft-deleted successfully.'));
});

export const restoreDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const department = await departmentRepository.restore(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }
  res.status(200).json(new ApiResponse(200, department, 'Department restored successfully.'));
});

export const getDepartmentStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await departmentRepository.getStats();
  res.status(200).json(new ApiResponse(200, stats, 'Department statistics fetched successfully.'));
});
