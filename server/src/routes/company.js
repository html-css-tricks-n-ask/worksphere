import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/company.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';

const router = Router();

/**
 * @openapi
 * /company/profile:
 *   get:
 *     summary: Get company profile
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully.
 */
router.get('/profile', authenticateUser, tenantMiddleware, getProfile);

/**
 * @openapi
 * /company/profile:
 *   put:
 *     summary: Update company profile
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               website: { type: string }
 *               address: { type: string }
 *               country: { type: string }
 *               timezone: { type: string }
 *               industry: { type: string }
 *               companySize: { type: string }
 *               logo: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated.
 */
router.put('/profile', authenticateUser, tenantMiddleware, updateProfile);

export default router;
