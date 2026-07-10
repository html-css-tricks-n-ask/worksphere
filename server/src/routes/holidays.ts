import { Router } from 'express';
import {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
  bulkCreateHolidays,
} from '../controllers/holiday.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

router.use(authenticateUser);
router.use(tenantMiddleware);

/**
 * @openapi
 * /holidays/bulk:
 *   post:
 *     summary: Bulk import holidays
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk', auditMiddleware('BULK_CREATE_HOLIDAYS'), bulkCreateHolidays);

/**
 * @openapi
 * /holidays:
 *   get:
 *     summary: Get all holidays for a year
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getHolidays);
router.post('/', auditMiddleware('CREATE_HOLIDAY'), createHoliday);

/**
 * @openapi
 * /holidays/{id}:
 *   get:
 *     summary: Get holiday by ID
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getHolidayById);
router.put('/:id', auditMiddleware('UPDATE_HOLIDAY'), updateHoliday);
router.delete('/:id', auditMiddleware('DELETE_HOLIDAY'), deleteHoliday);

export default router;
