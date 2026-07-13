import { Router } from 'express';
import {
  applyLeave,
  getLeaves,
  getLeaveById,
  updateLeaveStatus,
  getMyLeaves,
  getLeaveBalances,
} from '../controllers/leave.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

router.use(authenticateUser);
router.use(tenantMiddleware);

/**
 * @openapi
 * /leaves/me:
 *   get:
 *     summary: Get current employee's leave requests and balances
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', getMyLeaves);

/**
 * @openapi
 * /leaves/balances:
 *   get:
 *     summary: Get leave balances for current employee
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 */
router.get('/balances', getLeaveBalances);

/**
 * @openapi
 * /leaves:
 *   get:
 *     summary: Get all leave requests (admin/HR)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Apply for leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getLeaves);
router.post('/', auditMiddleware('APPLY_LEAVE'), applyLeave);

/**
 * @openapi
 * /leaves/{id}:
 *   get:
 *     summary: Get leave by ID
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getLeaveById);

/**
 * @openapi
 * /leaves/{id}/status:
 *   put:
 *     summary: Approve or reject a leave request (manager/admin)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', auditMiddleware('UPDATE_LEAVE_STATUS'), updateLeaveStatus);

export default router;
