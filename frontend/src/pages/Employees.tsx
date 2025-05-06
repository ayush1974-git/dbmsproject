import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Mail,
  Phone,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department_id: string;
  department_name: string;
  role: string;
  status: string;
  location: string;
  join_date: string;
  phone: string;
}

const Employees = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department_id: '',
    role: '',
    status: 'active',
    location: '',
    join_date: '',
    phone: '',
    payroll: {
      base_salary: 0,
      bonus: 0,
      deductions: 0
    }
  });
  const [error, setError] = useState('');
  
  // Fetch departments and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch departments
        const departmentsResponse = await fetch("http://localhost:5000/api/departments", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!departmentsResponse.ok) {
          throw new Error("Failed to fetch departments");
        }
        
        const departmentsData = await departmentsResponse.json();
        console.log("Departments data:", departmentsData);
        setDepartments(departmentsData);
        
        // Fetch employees
        const employeesResponse = await fetch("http://localhost:5000/api/employees", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!employeesResponse.ok) {
          throw new Error("Failed to fetch employees");
        }
        
        const employeesData = await employeesResponse.json();
        // Map department_name to department_id using the departments data
        const employeesWithDepartmentId = employeesData.map((employee: any) => {
          const department = departmentsData.find((dept: any) => dept.name === employee.department_name);
          return {
            ...employee,
            department_id: department ? department.id : undefined
          };
        });
        setEmployees(employeesWithDepartmentId);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(employee => {
    console.log("Employee:", employee);
    console.log("Department Filter:", departmentFilter);
    console.log("Employee Department ID:", employee.department_id);
    
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.role.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesDepartment = departmentFilter === "all" || employee.department_id === departmentFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    console.log("Matches Department:", matchesDepartment);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      case "on leave":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddEmployee = async () => {
    try {
      // Validate required fields
      if (!newEmployee.name || !newEmployee.email || !newEmployee.department_id || 
          !newEmployee.role || !newEmployee.location || !newEmployee.join_date || 
          !newEmployee.phone) {
        setError('All fields are required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmployee.email)) {
        setError('Invalid email format');
        return;
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newEmployee.phone)) {
        setError('Phone number must be 10 digits');
        return;
      }

      // Validate payroll fields
      if (typeof newEmployee.payroll.base_salary !== 'number' || newEmployee.payroll.base_salary < 0) {
        setError('Base salary must be a positive number');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/employees', newEmployee, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        setEmployees([...employees, response.data.employee]);
        setNewEmployee({
          name: '',
          email: '',
          department_id: '',
          role: '',
          status: 'active',
          location: '',
          join_date: '',
          phone: '',
          payroll: {
            base_salary: 0,
            bonus: 0,
            deductions: 0
          }
        });
        setError('');
      }
    } catch (err) {
      setError('Failed to add employee');
      console.error('Error adding employee:', err);
    }
  };

  const handleDelete = async (employeeId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      // Update local state
      setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));

      toast({
        title: "Success",
        description: "Employee deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newEmployee.department_id}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, department_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No departments available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                placeholder="Enter role"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newEmployee.location}
                onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="join_date">Join Date</Label>
              <Input
                id="join_date"
                type="date"
                value={newEmployee.join_date}
                onChange={(e) => setNewEmployee({ ...newEmployee, join_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newEmployee.status}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employees Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department_name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{renderStatusBadge(employee.status)}</TableCell>
                  <TableCell>{employee.location}</TableCell>
                  <TableCell>{new Date(employee.join_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
