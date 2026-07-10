import { Router } from 'express';
import {
  createCompensation,
  getCompensationHistory,
  getCompensations,
} from '../controllers/compensation.controller.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateUser);

router.post('/', createCompensation);
router.get('/', getCompensations);
router.get('/history/:employeeId', getCompensationHistory);

export default router;
