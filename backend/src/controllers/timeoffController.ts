import { Request, Response } from 'express';
import { executeQuery, generateUUID } from '../utils/dbUtils';

// Get all timeoff requests
export const getTimeOffRequests = async (req: Request, res: Response) => {
    try {
        const timeoffRequests = await executeQuery(
            `SELECT 
                t.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM time_off t
            JOIN employees e ON t.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY t.created_at DESC`
        );
        
        if (!timeoffRequests || timeoffRequests.length === 0) {
            return res.json([]);
        }
        
        res.json(timeoffRequests);
    } catch (error) {
        console.error('Error fetching timeoff requests:', error);
        res.status(500).json({ error: 'Failed to fetch timeoff requests' });
    }
};

// Get timeoff requests by employee ID
export const getEmployeeTimeOffRequests = async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        
        const timeoffRequests = await executeQuery(
            `SELECT 
                t.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM time_off t
            JOIN employees e ON t.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE t.employee_id = ?
            ORDER BY t.created_at DESC`,
            [employeeId]
        );
        
        if (!timeoffRequests || timeoffRequests.length === 0) {
            return res.json([]);
        }
        
        res.json(timeoffRequests);
    } catch (error) {
        console.error('Error fetching employee timeoff requests:', error);
        res.status(500).json({ error: 'Failed to fetch employee timeoff requests' });
    }
};

// Create a new timeoff request
export const createTimeOffRequest = async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            start_date,
            end_date,
            type,
            reason
        } = req.body;

        // Validate required fields
        if (!employee_id || !start_date || !end_date || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate date range
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (startDate > endDate) {
            return res.status(400).json({ error: 'Start date cannot be after end date' });
        }

        // Check if employee exists
        const employee = await executeQuery(
            'SELECT id FROM employees WHERE id = ?',
            [employee_id]
        );

        if (!employee || employee.length === 0) {
            return res.status(400).json({ error: 'Employee not found' });
        }

        const id = generateUUID();
        
        await executeQuery(
            `INSERT INTO time_off 
                (id, employee_id, start_date, end_date, type, status, reason)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
            [id, employee_id, start_date, end_date, type, reason || '']
        );

        const newRequest = await executeQuery(
            `SELECT 
                t.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM time_off t
            JOIN employees e ON t.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE t.id = ?`,
            [id]
        );

        if (!newRequest || newRequest.length === 0) {
            return res.status(500).json({ error: 'Failed to create timeoff request' });
        }

        res.status(201).json(newRequest[0]);
    } catch (error) {
        console.error('Error creating timeoff request:', error);
        res.status(500).json({ error: 'Failed to create timeoff request' });
    }
};

// Update timeoff request status
export const updateTimeOffStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Check if request exists
        const existingRequest = await executeQuery(
            'SELECT id FROM time_off WHERE id = ?',
            [id]
        );

        if (!existingRequest || existingRequest.length === 0) {
            return res.status(404).json({ error: 'Timeoff request not found' });
        }

        await executeQuery(
            'UPDATE time_off SET status = ? WHERE id = ?',
            [status, id]
        );

        const updatedRequest = await executeQuery(
            `SELECT 
                t.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM time_off t
            JOIN employees e ON t.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE t.id = ?`,
            [id]
        );

        if (!updatedRequest || updatedRequest.length === 0) {
            return res.status(404).json({ error: 'Timeoff request not found' });
        }

        res.json(updatedRequest[0]);
    } catch (error) {
        console.error('Error updating timeoff status:', error);
        res.status(500).json({ error: 'Failed to update timeoff status' });
    }
};

// Delete timeoff request
export const deleteTimeOffRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if request exists
        const existingRequest = await executeQuery(
            'SELECT id FROM time_off WHERE id = ?',
            [id]
        );

        if (!existingRequest || existingRequest.length === 0) {
            return res.status(404).json({ error: 'Timeoff request not found' });
        }

        const result = await executeQuery(
            'DELETE FROM time_off WHERE id = ?',
            [id]
        );

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ error: 'Timeoff request not found' });
        }

        res.json({ message: 'Timeoff request deleted successfully' });
    } catch (error) {
        console.error('Error deleting timeoff request:', error);
        res.status(500).json({ error: 'Failed to delete timeoff request' });
    }
}; 