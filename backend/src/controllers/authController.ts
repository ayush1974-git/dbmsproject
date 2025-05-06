import { Request, Response } from 'express';
import { executeQuery, comparePasswords } from '../utils/dbUtils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);

        // Find user by username
        const users = await executeQuery(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        console.log('Query result:', users);

        if (!users || users.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0]; // Get the first user since username is unique
        console.log('User found:', { id: user.id, username: user.username, role: user.role });

        // Compare passwords using fixed salt
        console.log('Comparing passwords...');
        const isValidPassword = await comparePasswords(password, user.password);
        console.log('Password comparison result:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        console.log('Login successful for user:', username);
        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
};

export const checkAuth = async (req: Request, res: Response) => {
    try {
        // The user data is already attached to the request by the authenticateToken middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get fresh user data from database
        const users = await executeQuery(
            'SELECT id, username, role, name, email FROM users WHERE id = ?',
            [user.id]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const freshUser = users[0];
        res.json({ user: freshUser });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 