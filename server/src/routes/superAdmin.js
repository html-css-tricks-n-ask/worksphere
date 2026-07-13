import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/superAdmin.controller.js';
import { authenticateUser, requirePermissions } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';

const router = Router();

// Secure all endpoints under Super Admin role authorization
router.use(authenticateUser);
router.use(tenantMiddleware);
router.use(requirePermissions(['Super Admin']));

router.get('/companies', getCompanies);
router.get('/companies/:id', getCompanyById);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

export default router;
