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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Calendar,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MessageSquare
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface TimeOffRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  department_name: string;
  start_date: string;
  end_date: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
}

const TimeOff = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    type: "vacation",
    reason: ""
  });

  // Fetch timeoff requests
  const fetchTimeOffRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timeoff', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeoff requests');
      }
      
      const data = await response.json();
      setTimeOffRequests(data);
    } catch (error) {
      console.error('Error fetching timeoff requests:', error);
      toast({
        title: "Error",
        description: "Failed to load timeoff requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employees for the dropdown
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTimeOffRequests();
    fetchEmployees();
  }, []);

  // Handle status update
  const handleUpdateRequest = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:5000/api/timeoff/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update timeoff request');
      }

      const data = await response.json();
      setTimeOffRequests(prev => prev.map(req => req.id === id ? data : req));
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Timeoff request updated successfully"
      });
    } catch (error) {
      console.error('Error updating timeoff request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update timeoff request',
        variant: "destructive"
      });
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/timeoff/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete timeoff request');
      }

      setTimeOffRequests(prev => prev.filter(req => req.id !== id));
      toast({
        title: "Success",
        description: "Timeoff request deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting timeoff request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete timeoff request',
        variant: "destructive"
      });
    }
  };

  // Handle new request submission
  const handleCreateRequest = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timeoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employee_id: newRequest.employee_id,
          start_date: newRequest.start_date,
          end_date: newRequest.end_date,
          type: newRequest.type,
          reason: newRequest.reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create timeoff request');
      }

      const data = await response.json();
      setTimeOffRequests(prev => [data, ...prev]);
      setNewRequest({
        employee_id: "",
        start_date: "",
        end_date: "",
        type: "vacation",
        reason: ""
      });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Timeoff request created successfully"
      });
    } catch (error) {
      console.error('Error creating timeoff request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create timeoff request',
        variant: "destructive"
      });
    }
  };

  // Filter time off requests based on filters
  const filteredRequests = timeOffRequests.filter(request => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesStatus;
  });

  // Calculate summary data
  const summaryData = {
    pendingRequests: timeOffRequests.filter(item => item.status === "pending").length,
    approvedRequests: timeOffRequests.filter(item => item.status === "approved").length,
    rejectedRequests: timeOffRequests.filter(item => item.status === "rejected").length,
    totalVacationDays: timeOffRequests
      .filter(item => item.type === "vacation" && item.status === "approved")
      .reduce((total, item) => {
        const start = new Date(item.start_date);
        const end = new Date(item.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return total + days;
      }, 0)
  };

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Time Off</h1>
        <p className="text-muted-foreground">Manage employee time off requests.</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Requests awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Requests
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.approvedRequests}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming approved time off
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vacation Days Used
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalVacationDays}</div>
            <p className="text-xs text-muted-foreground">
              Approved vacation days this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Declined Requests
            </CardTitle>
            <div className="rounded-full bg-red-100 p-2 text-red-600">
              <XCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.rejectedRequests}</div>
            <p className="text-xs text-muted-foreground">
              Requests that were declined
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and actions */}
      <div className="flex items-center justify-between">
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>
                Fill in the details to request time off.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="employee">Employee</Label>
                <Select
                  value={newRequest.employee_id}
                  onValueChange={(value) => setNewRequest({...newRequest, employee_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value) => setNewRequest({...newRequest, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newRequest.start_date}
                  onChange={(e) => setNewRequest({...newRequest, start_date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newRequest.end_date}
                  onChange={(e) => setNewRequest({...newRequest, end_date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                  placeholder="Enter reason for time off"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateRequest}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Time Off Requests Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No time off requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {request.employee_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{request.employee_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(request.start_date), 'MMM d, yyyy')}</span>
                      <span className="text-xs text-muted-foreground">
                        to {format(new Date(request.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </TableCell>
                  <TableCell>{format(new Date(request.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{renderStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {request.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleUpdateRequest(request.id, 'approved')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRequest(request.id, 'rejected')}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteRequest(request.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Comment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TimeOff;
