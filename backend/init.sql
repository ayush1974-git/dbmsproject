-- Create database if not exists
CREATE DATABASE IF NOT EXISTS dbms_project;
USE dbms_project;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department_id VARCHAR(36) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status ENUM('active', 'on leave', 'inactive') NOT NULL,
    location VARCHAR(255) NOT NULL,
    join_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Time Off table
CREATE TABLE IF NOT EXISTS time_off (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type ENUM('vacation', 'sick', 'personal', 'other') NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    bonus DECIMAL(10, 2) DEFAULT 0,
    deductions DECIMAL(10, 2) DEFAULT 0,
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add payroll_id to employees table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "employees";
SET @columnname = "payroll_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE 
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(36), ADD FOREIGN KEY (", @columnname, ") REFERENCES payroll(id)")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Insert departments
INSERT IGNORE INTO departments (id, name, description)
VALUES 
    (UUID(), 'Engineering', 'Software development and technical team'),
    (UUID(), 'Marketing', 'Marketing and communications team'),
    (UUID(), 'Human Resources', 'HR and people management team'),
    (UUID(), 'Finance', 'Financial and accounting team'),
    (UUID(), 'Operations', 'Business operations team');

-- Insert admin user with fixed hashed password
INSERT INTO users (id, username, password, role) 
VALUES (UUID(), 'admin', '$2b$10$fixed.salt.for.testinesINA905yKGq9IL41.3Wv6lwpKrivZIK', 'admin')
ON DUPLICATE KEY UPDATE password = '$2b$10$fixed.salt.for.testinesINA905yKGq9IL41.3Wv6lwpKrivZIK';

-- Insert HR user with fixed hashed password
INSERT INTO users (id, username, password, role)
VALUES (UUID(), 'hr', '$2b$10$fixed.salt.for.testineviU5v4XJpi3Cwb4lx9TnCMmAa.qzqa.', 'hr')
ON DUPLICATE KEY UPDATE password = '$2b$10$fixed.salt.for.testineviU5v4XJpi3Cwb4lx9TnCMmAa.qzqa.';

-- Insert dummy employee data
INSERT IGNORE INTO employees (id, name, email, department_id, role, status, location, join_date, phone)
SELECT 
    UUID(),
    'Michael Johnson',
    'michael.johnson@hiresync.com',
    (SELECT id FROM departments WHERE name = 'Engineering'),
    'Software Developer',
    'active',
    'New York',
    '2023-01-12',
    '+1 (555) 123-4567'
UNION ALL
SELECT 
    UUID(),
    'Sarah Williams',
    'sarah.williams@hiresync.com',
    (SELECT id FROM departments WHERE name = 'Marketing'),
    'Marketing Manager',
    'active',
    'Boston',
    '2022-03-15',
    '+1 (555) 987-6543'
UNION ALL
SELECT 
    UUID(),
    'David Brown',
    'david.brown@hiresync.com',
    (SELECT id FROM departments WHERE name = 'Human Resources'),
    'HR Specialist',
    'on leave',
    'Chicago',
    '2022-11-03',
    '+1 (555) 456-7890'
UNION ALL
SELECT 
    UUID(),
    'Emily Davis',
    'emily.davis@hiresync.com',
    (SELECT id FROM departments WHERE name = 'Finance'),
    'Financial Analyst',
    'active',
    'San Francisco',
    '2023-08-24',
    '+1 (555) 234-5678'
UNION ALL
SELECT 
    UUID(),
    'Robert Wilson',
    'robert.wilson@hiresync.com',
    (SELECT id FROM departments WHERE name = 'Engineering'),
    'UI/UX Designer',
    'active',
    'Seattle',
    '2023-04-07',
    '+1 (555) 876-5432';

-- Insert sample payroll data
INSERT IGNORE INTO payroll (id, employee_id, base_salary, bonus, deductions, net_salary, payment_date, status)
SELECT 
    UUID(),
    id,
    ROUND(RAND() * 5000 + 3000, 2), -- Random base salary between 3000 and 8000
    ROUND(RAND() * 1000, 2),        -- Random bonus up to 1000
    ROUND(RAND() * 500, 2),         -- Random deductions up to 500
    ROUND(RAND() * 5000 + 3000, 2), -- Random net salary between 3000 and 8000
    DATE_ADD(CURRENT_DATE, INTERVAL -1 MONTH), -- Payment date one month ago
    'paid'
FROM employees
WHERE id NOT IN (SELECT employee_id FROM payroll);

-- Insert sample document data
INSERT IGNORE INTO documents (id, title, type, uploaded_by)
SELECT 
    UUID(),
    'Employee Handbook',
    'Policy',
    (SELECT id FROM users WHERE username = 'admin')
UNION ALL
SELECT 
    UUID(),
    'Code of Conduct',
    'Policy',
    (SELECT id FROM users WHERE username = 'hr')
UNION ALL
SELECT 
    UUID(),
    'Leave Request Form',
    'Form',
    (SELECT id FROM users WHERE username = 'hr')
UNION ALL
SELECT 
    UUID(),
    'Quarterly Performance Report',
    'Report',
    (SELECT id FROM users WHERE username = 'admin')
UNION ALL
SELECT 
    UUID(),
    'Onboarding Checklist',
    'Procedure',
    (SELECT id FROM users WHERE username = 'hr');

-- Insert sample timeoff data
INSERT IGNORE INTO time_off (id, employee_id, start_date, end_date, type, status, reason)
SELECT 
    UUID(),
    e.id,
    DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY),
    DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY),
    'vacation',
    'pending',
    'Annual vacation leave'
FROM employees e
WHERE e.name = 'Michael Johnson'
UNION ALL
SELECT 
    UUID(),
    e.id,
    DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY),
    DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY),
    'sick',
    'approved',
    'Medical appointment'
FROM employees e
WHERE e.name = 'Sarah Williams'
UNION ALL
SELECT 
    UUID(),
    e.id,
    DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY),
    DATE_ADD(CURRENT_DATE, INTERVAL 16 DAY),
    'personal',
    'pending',
    'Family event'
FROM employees e
WHERE e.name = 'David Brown'; 