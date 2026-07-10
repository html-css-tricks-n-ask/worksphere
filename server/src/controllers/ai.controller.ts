import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { aiService } from '../services/ai.service.js';
import { ApiResponse } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

export const chat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  const companyId = req.user!.companyId;

  if (!query) {
    res.status(400).json(new ApiResponse(400, null, 'Chat query prompt is required.'));
    return;
  }

  const answer = await aiService.chat(companyId.toString(), query);
  res.status(200).json(new ApiResponse(200, { answer }, 'AI chat reply completed.'));
});

export const search = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.query;
  const companyId = req.user!.companyId;

  const searchQuery = String(query || '');

  // Perform global multi-entity database search
  const [employees, departments] = await Promise.all([
    Employee.find({
      companyId,
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { employeeId: { $regex: searchQuery, $options: 'i' } },
      ],
    }).limit(10),
    Department.find({
      companyId,
      name: { $regex: searchQuery, $options: 'i' },
    }).limit(5),
  ]);

  res.status(200).json(
    new ApiResponse(200, { employees, departments }, 'Global enterprise search completed.')
  );
});
