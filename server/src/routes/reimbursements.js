import { Router } from 'express';
import {
  createReimbursement,
  getReimbursements,
  getReimbursementById,
  approveReimbursement,
  deleteReimbursement,
  getPendingReimbursements,
} from '../controllers/reimbursement.controller.js';
import { authenticateUser, ensureEmployeeLinked } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateUser);

router.get('/approvals/pending', ensureEmployeeLinked, getPendingReimbursements);
router.post('/', ensureEmployeeLinked, createReimbursement);
router.get('/', ensureEmployeeLinked, getReimbursements);
router.get('/:id', getReimbursementById);
router.put('/:id/approve', ensureEmployeeLinked, approveReimbursement);
router.delete('/:id', deleteReimbursement);

export default router;
