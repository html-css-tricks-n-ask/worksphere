import { Router } from 'express';
import { uploadCompanyLogo, uploadAvatar, deleteAsset } from '../controllers/upload.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

/**
 * @openapi
 * /uploads/company-logo:
 *   post:
 *     summary: Upload Company Logo to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded.
 */
router.post('/company-logo', authenticateUser, upload.single('file'), uploadCompanyLogo);

/**
 * @openapi
 * /uploads/avatar:
 *   post:
 *     summary: Upload Profile Avatar to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded.
 */
router.post('/avatar', authenticateUser, upload.single('file'), uploadAvatar);

/**
 * @openapi
 * /uploads/{publicId}:
 *   delete:
 *     summary: Delete asset from Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Asset deleted.
 */
router.delete('/:publicId', authenticateUser, deleteAsset);

export default router;
