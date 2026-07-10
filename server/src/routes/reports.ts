import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

/**
 * @openapi
 * /reports:
 *   get:
 *     summary: Retrieve generated reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports.
 */
router.get('/', authenticateUser, asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, { placeholder: true }, 'Reports and analytics route placeholder.'));
}));

export default router;
