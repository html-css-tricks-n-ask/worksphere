import { Router } from 'express';
import {
  createReimbursement,
  getReimbursements,
  getReimbursementById,
  approveReimbursement,
  deleteReimbursement,
} from '../controllers/reimbursement.controller.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateUser);

router.post('/', createReimbursement);
router.get('/', getReimbursements);
router.get('/:id', getReimbursementById);
router.put('/:id/approve', approveReimbursement);
router.delete('/:id', deleteReimbursement);

export default router;
