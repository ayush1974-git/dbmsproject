import { Request, Response } from 'express';
import { executeQuery, generateUUID } from '../utils/dbUtils';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        e.id,
        e.name,
        e.email,
        e.role,
        e.status,
        e.location,
        e.join_date,
        e.phone,
        d.name as department_name,
        p.base_salary,
        p.bonus,
        p.deductions,
        p.net_salary,
        p.status as payroll_status
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN payroll p ON e.payroll_id = p.id
      ORDER BY e.created_at DESC
    `;
    
    const employees = await executeQuery(query);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      department_id,
      role,
      status,
      location,
      join_date,
      phone,
      payroll = {
        base_salary: 0,
        bonus: 0,
        deductions: 0
      }
    } = req.body;

    // Validate required fields
    if (!name || !email || !department_id || !role || !status || !location || !join_date || !phone) {
      return res.status(400).json({ error: 'All employee fields are required' });
    }

    // Validate payroll fields
    if (typeof payroll.base_salary !== 'number' || payroll.base_salary < 0) {
      return res.status(400).json({ error: 'Base salary must be a positive number' });
    }

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // Insert employee
      const employeeId = generateUUID();
      const insertEmployeeQuery = `
        INSERT INTO employees 
        (id, name, email, department_id, role, status, location, join_date, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(insertEmployeeQuery, [
        employeeId,
        name,
        email,
        department_id,
        role,
        status,
        location,
        join_date,
        phone
      ]);

      // Calculate net salary
      const netSalary = payroll.base_salary + payroll.bonus - payroll.deductions;

      // Create payroll record
      const payrollId = generateUUID();
      const insertPayrollQuery = `
        INSERT INTO payroll 
        (id, employee_id, base_salary, bonus, deductions, net_salary, payment_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `;
      
      await executeQuery(insertPayrollQuery, [
        payrollId,
        employeeId,
        payroll.base_salary,
        payroll.bonus,
        payroll.deductions,
        netSalary,
        join_date
      ]);

      // Update employee with payroll_id
      const updateEmployeeQuery = `
        UPDATE employees 
        SET payroll_id = ? 
        WHERE id = ?
      `;
      
      await executeQuery(updateEmployeeQuery, [payrollId, employeeId]);

      // Commit transaction
      await executeQuery('COMMIT');

      res.status(201).json({ 
        message: 'Employee added successfully',
        employee: {
          id: employeeId,
          name,
          email,
          role,
          status,
          location,
          join_date,
          phone,
          payroll_id: payrollId,
          payroll: {
            base_salary: payroll.base_salary,
            bonus: payroll.bonus,
            deductions: payroll.deductions,
            net_salary: netSalary,
            status: 'pending'
          }
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Start transaction
        await executeQuery('START TRANSACTION');

        try {
            // Get employee's payroll_id
            const [employee] = await executeQuery(
                'SELECT payroll_id FROM employees WHERE id = ?',
                [id]
            );

            if (!employee) {
                await executeQuery('ROLLBACK');
                return res.status(404).json({ error: 'Employee not found' });
            }

            // Delete employee
            await executeQuery('DELETE FROM employees WHERE id = ?', [id]);

            // If employee has a payroll record, delete it
            if (employee.payroll_id) {
                await executeQuery('DELETE FROM payroll WHERE id = ?', [employee.payroll_id]);
            }

            // Commit transaction
            await executeQuery('COMMIT');

            res.json({ message: 'Employee deleted successfully' });
        } catch (error) {
            // Rollback transaction on error
            await executeQuery('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
}; 