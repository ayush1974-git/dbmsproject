import { Router } from 'express';
import { 
    getTimeOffRequests,
    getEmployeeTimeOffRequests,
    createTimeOffRequest,
    updateTimeOffStatus,
    deleteTimeOffRequest
} from '../controllers/timeoffController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All timeoff routes require authentication
router.use(authenticateToken);

// Get all timeoff requests
router.get('/', getTimeOffRequests);

// Get timeoff requests for a specific employee
router.get('/employee/:employeeId', getEmployeeTimeOffRequests);

// Create a new timeoff request
router.post('/', createTimeOffRequest);

// Update timeoff request status
router.patch('/:id/status', updateTimeOffStatus);

// Delete timeoff request
router.delete('/:id', deleteTimeOffRequest);

export default router; 