import { Router } from 'express';
import { login, logout, checkAuth } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/check', authenticateToken, checkAuth);

export default router; 