import { Router } from 'express';
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../controllers/team.controller.js';
import { authenticateUser, requirePermissions } from '../middlewares/auth.js';
import { tenantMiddleware } from '../middlewares/tenant.js';

const router = Router();

router.use(authenticateUser);
router.use(tenantMiddleware);

router.get('/', getTeams);
router.post('/', requirePermissions(['Company Admin', 'HR']), createTeam);
router.put('/:id', requirePermissions(['Company Admin', 'HR']), updateTeam);
router.delete('/:id', requirePermissions(['Company Admin', 'HR']), deleteTeam);

export default router;
