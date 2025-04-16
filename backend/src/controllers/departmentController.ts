import { Request, Response } from 'express';
import { executeQuery, generateUUID } from '../utils/dbUtils';

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await executeQuery(
            `SELECT 
                d.id, 
                d.name, 
                d.description,
                COUNT(e.id) as employeeCount
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id
            GROUP BY d.id, d.name, d.description
            ORDER BY d.name`
        );
        
        // Ensure we're returning an array
        const departmentsArray = Array.isArray(departments) ? departments : [departments];
        
        res.json(departmentsArray);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

export const getDepartmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const department = await executeQuery(
            `SELECT 
                d.id, 
                d.name, 
                d.description,
                COUNT(e.id) as employeeCount
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id
            WHERE d.id = ?
            GROUP BY d.id, d.name, d.description`,
            [id]
        );
        
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        res.json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ error: 'Failed to fetch department' });
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        const id = generateUUID();
        
        await executeQuery(
            'INSERT INTO departments (id, name, description) VALUES (?, ?, ?)',
            [id, name, description]
        );

        const newDepartment = await executeQuery(
            `SELECT 
                d.id, 
                d.name, 
                d.description,
                COUNT(e.id) as employeeCount
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id
            WHERE d.id = ?
            GROUP BY d.id, d.name, d.description`,
            [id]
        );

        res.status(201).json(newDepartment);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ error: 'Failed to create department' });
    }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        // Check if department exists
        const existingDepartment = await executeQuery(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        if (!existingDepartment || existingDepartment.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // Update department
        await executeQuery(
            'UPDATE departments SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );

        // Get updated department
        const updatedDepartment = await executeQuery(
            `SELECT 
                d.id, 
                d.name, 
                d.description,
                COUNT(e.id) as employeeCount
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id
            WHERE d.id = ?
            GROUP BY d.id, d.name, d.description`,
            [id]
        );

        res.json(updatedDepartment[0]);
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ error: 'Failed to update department' });
    }
};

export const getDepartmentEmployees = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if department exists
        const department = await executeQuery(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        if (!department || department.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // Get employees in department
        const employees = await executeQuery(
            `SELECT 
                e.id,
                e.name,
                e.email,
                e.role,
                e.status,
                e.location,
                e.join_date,
                e.phone
            FROM employees e
            WHERE e.department_id = ?
            ORDER BY e.name`,
            [id]
        );

        res.json(employees);
    } catch (error) {
        console.error('Error fetching department employees:', error);
        res.status(500).json({ error: 'Failed to fetch department employees' });
    }
}; 