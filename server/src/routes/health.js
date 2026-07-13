import { Router, } from 'express';
import { ApiResponse } from '../utils/responseWrapper.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Get system health status
 *     description: Check if the WorkSphere server is running and database is accessible.
 *     responses:
 *       200:
 *         description: Server is healthy.
 */
router.get('/', (req, res) => {
  const healthInfo = {
    uptime: process.uptime(),
    status: 'UP',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  };
  res.status(200).json(new ApiResponse(200, healthInfo, 'System health checks passed.'));
});

export default router;
