import { Router } from 'express';
import {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
  restoreDesignation,
} from '../controllers/designation.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

// Secure all designation routes
router.use(authenticateUser);
router.use(tenantMiddleware);

/**
 * @openapi
 * /designations:
 *   get:
 *     summary: Retrieve designations
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getDesignations);
router.post('/', auditMiddleware('CREATE_DESIGNATION'), createDesignation);

/**
 * @openapi
 * /designations/{id}:
 *   get:
 *     summary: Get designation details
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Soft delete designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getDesignationById);
router.put('/:id', auditMiddleware('UPDATE_DESIGNATION'), updateDesignation);
router.delete('/:id', auditMiddleware('DELETE_DESIGNATION'), deleteDesignation);

/**
 * @openapi
 * /designations/{id}/restore:
 *   put:
 *     summary: Restore soft deleted designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/restore', auditMiddleware('RESTORE_DESIGNATION'), restoreDesignation);

export default router;
