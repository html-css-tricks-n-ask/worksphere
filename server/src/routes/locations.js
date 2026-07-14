import { Router } from 'express';
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller.js';
import { authenticateUser, requirePermissions } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';

const router = Router();

router.use(authenticateUser);
router.use(tenantMiddleware);

router.get('/', getLocations);
router.post('/', requirePermissions(['Company Admin', 'HR']), createLocation);
router.put('/:id', requirePermissions(['Company Admin', 'HR']), updateLocation);
router.delete('/:id', requirePermissions(['Company Admin', 'HR']), deleteLocation);

export default router;
