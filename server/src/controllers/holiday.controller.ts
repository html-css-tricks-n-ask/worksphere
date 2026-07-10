import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { holidayRepository } from '../repositories/holiday.repository.js';
import { createHolidaySchema, updateHolidaySchema } from '../validators/holiday.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createHoliday = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createHolidaySchema.parse(req.body);
  const companyId = req.user!.companyId.toString();

  const date = new Date(parsed.date);

  // Prevent duplicates on the same date
  const existing = await holidayRepository.findByDate(date, companyId);
  if (existing) {
    throw new ApiError(409, `A holiday already exists on ${date.toDateString()}: "${existing.name}".`);
  }

  const holiday = await holidayRepository.create({
    name: parsed.name,
    date,
    type: parsed.type,
    companyId: companyId as any,
  });

  res.status(201).json(new ApiResponse(201, holiday, 'Holiday created successfully.'));
});

export const getHolidays = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const year = req.query.year ? parseInt(String(req.query.year), 10) : new Date().getFullYear();
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;

  const result = await holidayRepository.findAll({
    companyId: req.user!.companyId.toString(),
    year,
    page,
    limit,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        holidays: result.holidays,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Holidays fetched successfully.'
    )
  );
});

export const getHolidayById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const holiday = await holidayRepository.findById(req.params.id);
  if (!holiday) {
    throw new ApiError(404, 'Holiday not found.');
  }
  res.status(200).json(new ApiResponse(200, holiday, 'Holiday fetched successfully.'));
});

export const updateHoliday = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = updateHolidaySchema.parse(req.body);

  const holiday = await holidayRepository.update(req.params.id, parsed as any);
  if (!holiday) {
    throw new ApiError(404, 'Holiday not found.');
  }

  res.status(200).json(new ApiResponse(200, holiday, 'Holiday updated successfully.'));
});

export const deleteHoliday = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const holiday = await holidayRepository.delete(req.params.id);
  if (!holiday) {
    throw new ApiError(404, 'Holiday not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Holiday deleted successfully.'));
});

export const bulkCreateHolidays = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId.toString();
  const items: Array<{ name: string; date: string; type: string }> = req.body.holidays;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Please provide a list of holidays to import.');
  }

  const results = [];
  const errors = [];

  for (const item of items) {
    try {
      const parsed = createHolidaySchema.parse(item);
      const date = new Date(parsed.date);

      const existing = await holidayRepository.findByDate(date, companyId);
      if (existing) {
        errors.push({ name: parsed.name, date: parsed.date, error: 'Already exists' });
        continue;
      }

      const holiday = await holidayRepository.create({
        name: parsed.name,
        date,
        type: parsed.type,
        companyId: companyId as any,
      });
      results.push(holiday);
    } catch (err) {
      errors.push({ name: item.name, date: item.date, error: (err as Error).message });
    }
  }

  res.status(201).json(
    new ApiResponse(
      201,
      { created: results.length, failed: errors.length, errors },
      `Successfully imported ${results.length} holidays.`
    )
  );
});
