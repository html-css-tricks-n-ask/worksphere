import { Router } from 'express';
import {
  createSalaryStructure,
  getSalaryStructures,
  updateSalaryStructure,
  deleteSalaryStructure,
  processPayroll,
  getPayrolls,
  getPayrollById,
  updatePayrollStatus,
  getPayslip,
  emailPayslip,
  getPayrollWidgets,
} from '../controllers/payroll.controller.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

// Apply authentication guard to all routes
router.use(authenticateUser);

// Salary structures routes
router.post('/salary-structure', createSalaryStructure);
router.get('/salary-structure', getSalaryStructures);
router.put('/salary-structure/:id', updateSalaryStructure);
router.delete('/salary-structure/:id', deleteSalaryStructure);

// Payroll processing routes
router.post('/process', processPayroll);
router.get('/', getPayrolls);
router.get('/widgets', getPayrollWidgets);
router.get('/:id', getPayrollById);
router.put('/:id/status', updatePayrollStatus);

// Payslips routes
router.get('/:id/payslip', getPayslip);
router.post('/:id/email', emailPayslip);

export default router;
