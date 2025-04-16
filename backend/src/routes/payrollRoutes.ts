import { Router } from 'express';
import { 
    getPayrolls, 
    getPayrollById, 
    createPayroll, 
    updatePayroll 
} from '../controllers/payrollController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All payroll routes require authentication
router.use(authenticateToken);

// Get all payrolls
router.get('/', getPayrolls);

// Get payroll by ID
router.get('/:id', getPayrollById);

// Create new payroll
router.post('/', createPayroll);

// Update payroll
router.put('/:id', updatePayroll);

export default router; 