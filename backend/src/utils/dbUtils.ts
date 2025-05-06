import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import pool from '../config/database';

// Using the same salt as in init.sql for admin and HR users
const FIXED_SALT = '$2b$10$fixed.salt.for.testinesINA905yKGq9IL41.3Wv6lwpKrivZIK';

export const generateUUID = (): string => {
    return uuidv4();
};

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, FIXED_SALT);
};

export const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    try {
        if (!plainPassword || !hashedPassword) {
            console.error('Missing password or hash');
            return false;
        }
        // For testing purposes, we'll compare with the fixed hash
        const hashedInput = await bcrypt.hash(plainPassword, FIXED_SALT);
        return hashedInput === hashedPassword;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
    try {
        const [results] = await pool.query(query, params);
        // For SELECT queries, return all rows
        if (query.trim().toUpperCase().startsWith('SELECT')) {
            return Array.isArray(results) ? results : [results];
        }
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}; 