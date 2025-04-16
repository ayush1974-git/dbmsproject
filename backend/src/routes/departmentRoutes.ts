import { Router } from 'express';
import { 
    getDepartments, 
    getDepartmentById, 
    createDepartment,
    updateDepartment,
    getDepartmentEmployees
} from '../controllers/departmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getDepartments);
router.get('/:id', authenticateToken, getDepartmentById);
router.get('/:id/employees', authenticateToken, getDepartmentEmployees);
router.post('/', authenticateToken, createDepartment);
router.put('/:id', authenticateToken, updateDepartment);

export default router; 