USE dbms_project;

-- Insert dummy employee data
INSERT INTO employees (id, name, email, department, role, status, location, join_date, phone)
VALUES 
    (UUID(), 'Michael Johnson', 'michael.johnson@hiresync.com', 'Engineering', 'Software Developer', 'active', 'New York', '2023-01-12', '+1 (555) 123-4567'),
    (UUID(), 'Sarah Williams', 'sarah.williams@hiresync.com', 'Marketing', 'Marketing Manager', 'active', 'Boston', '2022-03-15', '+1 (555) 987-6543'),
    (UUID(), 'David Brown', 'david.brown@hiresync.com', 'Human Resources', 'HR Specialist', 'on leave', 'Chicago', '2022-11-03', '+1 (555) 456-7890'),
    (UUID(), 'Emily Davis', 'emily.davis@hiresync.com', 'Finance', 'Financial Analyst', 'active', 'San Francisco', '2023-08-24', '+1 (555) 234-5678'),
    (UUID(), 'Robert Wilson', 'robert.wilson@hiresync.com', 'Engineering', 'UI/UX Designer', 'active', 'Seattle', '2023-04-07', '+1 (555) 876-5432'); 