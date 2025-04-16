import { Router } from 'express';
import { getEmployees, addEmployee, deleteEmployee } from '../controllers/employeeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get all employees
router.get('/', authenticateToken, getEmployees);

// Add new employee
router.post('/', authenticateToken, addEmployee);

// Delete employee
router.delete('/:id', authenticateToken, deleteEmployee);

export default router; 