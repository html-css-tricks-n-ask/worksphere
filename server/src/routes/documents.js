import { Router, } from 'express';
import { ApiResponse } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

/**
 * @openapi
 * /documents:
 *   get:
 *     summary: Retrieve list of documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents.
 */
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { placeholder: true }, 'Documents management route placeholder.'));
}));

export default router;
