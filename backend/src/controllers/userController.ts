import { Request, Response } from 'express';
import { executeQuery, hashPassword } from '../utils/dbUtils';
import bcrypt from 'bcrypt';
import { generateUUID } from '../utils/uuidUtils';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const [users] = await executeQuery('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const addUser = async (req: Request, res: Response) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await executeQuery(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, password, email]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await executeQuery('SELECT id, username, email, role, name, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, role, name, email } = req.body;

        // Validate input
        if (!username || !password || !role || !email) {
            return res.status(400).json({ error: 'Username, password, role, and email are required' });
        }

        // Check if username already exists
        const existingUser = await executeQuery(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password using fixed salt
        const hashedPassword = await hashPassword(password);

        // Create user
        const userId = generateUUID();
        await executeQuery(
            'INSERT INTO users (id, username, email, password, role, name) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, username, email, hashedPassword, role, name || username]
        );

        res.status(201).json({ 
            message: 'User created successfully',
            user: { id: userId, username, email, role, name: name || username }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { username, password, role, name, email } = req.body;

        // Validate input
        if (!username || !role || !email) {
            return res.status(400).json({ error: 'Username, role, and email are required' });
        }

        // Check if user exists
        const existingUser = await executeQuery(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentUser = existingUser[0];

        // Check if new username already exists (excluding current user)
        const usernameExists = await executeQuery(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, id]
        );

        if (usernameExists.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Prepare update fields
        const updateFields = ['username = ?', 'role = ?', 'email = ?'];
        const updateValues = [username, role, email];

        // Add name if provided
        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }

        // Add password if provided
        if (password) {
            const hashedPassword = await hashPassword(password);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        // Add id for WHERE clause
        updateValues.push(id);

        // Update user
        await executeQuery(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // Get updated user data
        const updatedUser = await executeQuery(
            'SELECT id, username, email, role, name FROM users WHERE id = ?',
            [id]
        );

        res.json({ 
            message: 'User updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await executeQuery(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await executeQuery('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
