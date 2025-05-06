import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Loader2, Users, Edit } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
  role: string;
  status: string;
  location: string;
  join_date: string;
  phone: string;
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewEmployeesDialogOpen, setIsViewEmployeesDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentEmployees, setDepartmentEmployees] = useState<Employee[]>([]);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });
  const [editDepartment, setEditDepartment] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentEmployees = async (departmentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${departmentId}/employees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch department employees');
      }

      const data = await response.json();
      setDepartmentEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching department employees:', error);
      toast({
        title: "Error",
        description: "Failed to load department employees",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDepartment)
      });

      if (!response.ok) {
        throw new Error('Failed to create department');
      }

      toast({
        title: "Success",
        description: "Department created successfully",
      });

      setIsCreateDialogOpen(false);
      setNewDepartment({ name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive"
      });
    }
  };

  const handleEditDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      const response = await fetch(`http://localhost:5000/api/departments/${selectedDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editDepartment)
      });

      if (!response.ok) {
        throw new Error('Failed to update department');
      }

      toast({
        title: "Success",
        description: "Department updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
      setEditDepartment({ name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive"
      });
    }
  };

  const handleViewEmployees = async (department: Department) => {
    setSelectedDepartment(department);
    setIsViewEmployeesDialogOpen(true);
    await fetchDepartmentEmployees(department.id);
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setEditDepartment({
      name: department.name,
      description: department.description
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="Enter department name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="Enter department description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDepartment}>
                Create Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Department Name</Label>
              <Input
                id="edit-name"
                value={editDepartment.name}
                onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                placeholder="Enter department name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDepartment.description}
                onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                placeholder="Enter department description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDepartment}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Employees Dialog */}
      <Dialog open={isViewEmployeesDialogOpen} onOpenChange={setIsViewEmployeesDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Employees in {selectedDepartment?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant={
                        employee.status === 'active' ? 'default' :
                        employee.status === 'on leave' ? 'secondary' :
                        'destructive'
                      }>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.location}</TableCell>
                    <TableCell>{new Date(employee.join_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {departmentEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No employees in this department
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>{department.description}</TableCell>
                  <TableCell>{department.employeeCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(department)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Department
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewEmployees(department)}>
                          <Users className="mr-2 h-4 w-4" />
                          View Employees
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Departments; 