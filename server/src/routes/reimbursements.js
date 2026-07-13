import { Router } from 'express';
import {
  createReimbursement,
  getReimbursements,
  getReimbursementById,
  approveReimbursement,
  deleteReimbursement,
} from '../controllers/reimbursement.controller.js';
import { authenticateUser, ensureEmployeeLinked } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateUser);

router.post('/', ensureEmployeeLinked, createReimbursement);
router.get('/', ensureEmployeeLinked, getReimbursements);
router.get('/:id', getReimbursementById);
router.put('/:id/approve', approveReimbursement);
router.delete('/:id', deleteReimbursement);

export default router;
