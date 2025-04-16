import { Request, Response } from 'express';
import { executeQuery, generateUUID } from '../utils/dbUtils';

export const getPayrolls = async (req: Request, res: Response) => {
    try {
        const payrolls = await executeQuery(
            `SELECT 
                p.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY p.payment_date DESC`
        );
        
        if (!payrolls || payrolls.length === 0) {
            return res.json([]);
        }
        
        res.json(payrolls);
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        res.status(500).json({ error: 'Failed to fetch payrolls' });
    }
};

export const getPayrollById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payrolls = await executeQuery(
            `SELECT 
                p.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE p.id = ?`,
            [id]
        );
        
        if (!payrolls || payrolls.length === 0) {
            return res.status(404).json({ error: 'Payroll not found' });
        }
        
        res.json(payrolls[0]);
    } catch (error) {
        console.error('Error fetching payroll:', error);
        res.status(500).json({ error: 'Failed to fetch payroll' });
    }
};

export const createPayroll = async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            base_salary,
            bonus = 0,
            deductions = 0,
            payment_date
        } = req.body;

        if (!employee_id || !base_salary || !payment_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const net_salary = base_salary + bonus - deductions;
        const id = generateUUID();
        
        await executeQuery(
            `INSERT INTO payroll 
                (id, employee_id, base_salary, bonus, deductions, net_salary, payment_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [id, employee_id, base_salary, bonus, deductions, net_salary, payment_date]
        );

        // Update employee's payroll_id
        await executeQuery(
            'UPDATE employees SET payroll_id = ? WHERE id = ?',
            [id, employee_id]
        );

        const newPayrolls = await executeQuery(
            `SELECT 
                p.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE p.id = ?`,
            [id]
        );

        if (!newPayrolls || newPayrolls.length === 0) {
            return res.status(500).json({ error: 'Failed to create payroll' });
        }

        res.status(201).json(newPayrolls[0]);
    } catch (error) {
        console.error('Error creating payroll:', error);
        res.status(500).json({ error: 'Failed to create payroll' });
    }
};

export const updatePayroll = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            base_salary,
            bonus,
            deductions,
            payment_date,
            status
        } = req.body;

        console.log('Updating payroll with data:', { id, base_salary, bonus, deductions, payment_date, status });

        // Validate required fields
        if (!base_salary || !payment_date || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Ensure numeric values
        const baseSalary = Number(base_salary);
        const bonusAmount = Number(bonus || 0);
        const deductionsAmount = Number(deductions || 0);

        if (isNaN(baseSalary) || isNaN(bonusAmount) || isNaN(deductionsAmount)) {
            return res.status(400).json({ error: 'Invalid numeric values' });
        }

        // Format payment date
        const formattedPaymentDate = new Date(payment_date).toISOString().split('T')[0];

        // Calculate net salary
        const net_salary = baseSalary + bonusAmount - deductionsAmount;
        
        // Update payroll
        const updateResult = await executeQuery(
            `UPDATE payroll 
            SET 
                base_salary = ?,
                bonus = ?,
                deductions = ?,
                net_salary = ?,
                payment_date = ?,
                status = ?
            WHERE id = ?`,
            [baseSalary, bonusAmount, deductionsAmount, net_salary, formattedPaymentDate, status, id]
        );

        console.log('Update result:', updateResult);

        // Get updated payroll with employee details
        const [updatedPayroll] = await executeQuery(
            `SELECT 
                p.*,
                e.name as employee_name,
                e.email,
                d.name as department_name
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE p.id = ?`,
            [id]
        );

        if (!updatedPayroll) {
            return res.status(500).json({ error: 'Failed to update payroll' });
        }

        res.json(updatedPayroll);
    } catch (error) {
        console.error('Error updating payroll:', error);
        res.status(500).json({ 
            error: 'Failed to update payroll',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 