import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import departmentRoutes from './routes/departmentRoutes';
import payrollRoutes from './routes/payrollRoutes';
import employeeRoutes from './routes/employeeRoutes';
import documentRoutes from './routes/documentRoutes';
import timeoffRoutes from './routes/timeoffRoutes';
import { authenticateToken, isAdmin } from './middleware/authMiddleware';
import { getAllUsers, createUser, updateUser, deleteUser } from './controllers/userController';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic route
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Welcome to DBMS Project API' });
});

// Routes
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/timeoff', timeoffRoutes);

// Admin user management routes
app.get('/api/admin/users', authenticateToken, isAdmin, getAllUsers);
app.post('/api/admin/users', authenticateToken, isAdmin, createUser);
app.put('/api/admin/users/:id', authenticateToken, isAdmin, updateUser);
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, deleteUser);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 