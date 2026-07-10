import { Router } from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  restoreDepartment,
  getDepartmentStats,
} from '../controllers/department.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

// Apply auth and tenant validation to all department routes
router.use(authenticateUser);
router.use(tenantMiddleware);

/**
 * @openapi
 * /departments/stats:
 *   get:
 *     summary: Retrieve department stats
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched.
 */
router.get('/stats', getDepartmentStats);

/**
 * @openapi
 * /departments:
 *   get:
 *     summary: Retrieve list of departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments.
 *   post:
 *     summary: Create department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created.
 */
router.get('/', getDepartments);
router.post('/', auditMiddleware('CREATE_DEPARTMENT'), createDepartment);

/**
 * @openapi
 * /departments/{id}:
 *   get:
 *     summary: Get department details
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Soft delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getDepartmentById);
router.put('/:id', auditMiddleware('UPDATE_DEPARTMENT'), updateDepartment);
router.delete('/:id', auditMiddleware('DELETE_DEPARTMENT'), deleteDepartment);

/**
 * @openapi
 * /departments/{id}/restore:
 *   put:
 *     summary: Restore soft-deleted department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/restore', auditMiddleware('RESTORE_DEPARTMENT'), restoreDepartment);

export default router;
