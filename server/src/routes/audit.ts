import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { ApiResponse } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticateUser);
router.use(tenantMiddleware);

router.get(
  '/',
  asyncHandler(async (req: any, res: any) => {
    const limit = parseInt(req.query.limit || '100', 10);
    const logs = await auditLogRepository.findAll(limit);
    res.status(200).json(new ApiResponse(200, { logs }, 'Audit logs retrieved successfully.'));
  })
);

export default router;
