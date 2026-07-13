import { Router } from 'express';
import {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
} from '../controllers/shift.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

router.use(authenticateUser);
router.use(tenantMiddleware);

/**
 * @openapi
 * /shifts:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getShifts);
router.post('/', auditMiddleware('CREATE_SHIFT'), createShift);

/**
 * @openapi
 * /shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getShiftById);
router.put('/:id', auditMiddleware('UPDATE_SHIFT'), updateShift);
router.delete('/:id', auditMiddleware('DELETE_SHIFT'), deleteShift);

export default router;
