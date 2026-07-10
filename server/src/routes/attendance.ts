import { Router } from 'express';
import {
  checkIn,
  checkOut,
  manualAttendance,
  getAttendanceLogs,
  getAttendanceStats,
  getMyAttendance,
} from '../controllers/attendance.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

router.use(authenticateUser);
router.use(tenantMiddleware);

/**
 * @openapi
 * /attendance/me:
 *   get:
 *     summary: Get current user's attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', getMyAttendance);

/**
 * @openapi
 * /attendance/stats:
 *   get:
 *     summary: Get today's attendance dashboard stats
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', getAttendanceStats);

/**
 * @openapi
 * /attendance:
 *   get:
 *     summary: Get all attendance logs (admin)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getAttendanceLogs);

/**
 * @openapi
 * /attendance/check-in:
 *   post:
 *     summary: Check in for the day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/check-in', auditMiddleware('ATTENDANCE_CHECKIN'), checkIn);

/**
 * @openapi
 * /attendance/check-out:
 *   post:
 *     summary: Check out for the day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/check-out', auditMiddleware('ATTENDANCE_CHECKOUT'), checkOut);

/**
 * @openapi
 * /attendance/manual:
 *   post:
 *     summary: Manually log attendance (admin/HR)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/manual', auditMiddleware('ATTENDANCE_MANUAL'), manualAttendance);

export default router;
