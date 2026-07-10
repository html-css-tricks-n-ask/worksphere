import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  uploadAvatar,
  uploadDocument,
  deleteEmployeeDocument,
  getEmployeeTimeline,
  getDashboardWidgets,
  exportEmployees,
  importEmployees,
} from '../controllers/employee.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Apply auth and tenant guards to all employee routes
router.use(authenticateUser);
router.use(tenantMiddleware);

/**
 * @openapi
 * /employees/widgets:
 *   get:
 *     summary: Get employee statistics widgets
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get('/widgets', getDashboardWidgets);

/**
 * @openapi
 * /employees/export:
 *   get:
 *     summary: Export employee registry to CSV file
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get('/export', exportEmployees);

/**
 * @openapi
 * /employees/import:
 *   post:
 *     summary: Bulk import employees profiles from JSON list
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.post('/import', auditMiddleware('IMPORT_EMPLOYEES'), importEmployees);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: Fetch registry of staff members
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create new employee profile
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getEmployees);
router.post('/', auditMiddleware('CREATE_EMPLOYEE'), createEmployee);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     summary: View employee details
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Modify employee profile
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Soft-delete employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getEmployeeById);
router.put('/:id', auditMiddleware('UPDATE_EMPLOYEE'), updateEmployee);
router.delete('/:id', auditMiddleware('DELETE_EMPLOYEE'), deleteEmployee);

/**
 * @openapi
 * /employees/{id}/restore:
 *   put:
 *     summary: Restore employee profile
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/restore', auditMiddleware('RESTORE_EMPLOYEE'), restoreEmployee);

/**
 * @openapi
 * /employees/{id}/avatar:
 *   post:
 *     summary: Upload/replace profile photo
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/avatar', upload.single('file'), uploadAvatar);

/**
 * @openapi
 * /employees/{id}/documents:
 *   post:
 *     summary: Upload PAN/Passport/Resume documents
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/documents', upload.single('file'), uploadDocument);

/**
 * @openapi
 * /employees/{id}/documents/{documentId}:
 *   delete:
 *     summary: Remove profile document asset
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/documents/:documentId', deleteEmployeeDocument);

/**
 * @openapi
 * /employees/{id}/timeline:
 *   get:
 *     summary: Retrieve promotions and transfer activity timeline
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/timeline', getEmployeeTimeline);

export default router;
