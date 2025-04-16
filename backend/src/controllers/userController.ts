import { Request, Response } from 'express';
import { getAllUsers, createUser } from '../models/userModel';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const addUser = async (req: Request, res: Response) => {
    const { username, password, email } = req.body;
    try {
        const userId = await createUser(username, password, email);
        res.status(201).json({ id: userId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};
