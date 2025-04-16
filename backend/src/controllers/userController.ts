import { Request, Response } from 'express';
import { executeQuery } from '../utils/dbUtils';

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
