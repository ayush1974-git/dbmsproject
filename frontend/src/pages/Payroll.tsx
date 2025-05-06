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
import { Input } from "@/components/ui/input";
import { Search, Download, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  department_name: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  status: 'paid' | 'pending' | 'cancelled';
  payment_date: string;
}

const Payroll = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    // Fetch payroll records from API
    const fetchPayrollRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await fetch('http://localhost:5000/api/payroll', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPayrollRecords(data);
      } catch (error) {
        console.error('Error fetching payroll records:', error);
      }
    };

    fetchPayrollRecords();
  }, []);

  const filteredRecords = payrollRecords.filter(record => 
    record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedMonth === "all" || record.payment_date.includes(selectedMonth))
  );

  const handleUpdate = async () => {
    if (!editingRecord) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Calculate net salary
      const netSalary = editingRecord.base_salary + editingRecord.bonus - editingRecord.deductions;

      const response = await fetch(`http://localhost:5000/api/payroll/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base_salary: Number(editingRecord.base_salary),
          bonus: Number(editingRecord.bonus),
          deductions: Number(editingRecord.deductions),
          payment_date: editingRecord.payment_date,
          status: editingRecord.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payroll record');
      }

      const data = await response.json();

      // Update the local state
      setPayrollRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === data.id ? {
            ...record,
            base_salary: data.base_salary,
            bonus: data.bonus,
            deductions: data.deductions,
            net_salary: data.net_salary,
            status: data.status,
            payment_date: data.payment_date
          } : record
        )
      );

      toast({
        title: "Success",
        description: "Payroll record updated successfully"
      });

      setIsEditing(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating payroll record:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payroll record",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (record: PayrollRecord) => {
    setEditingRecord(record);
    setIsEditing(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <div className="flex gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            Process Payroll
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            <SelectItem value="2024-01">January 2024</SelectItem>
            <SelectItem value="2024-02">February 2024</SelectItem>
            <SelectItem value="2024-03">March 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employee_name}</TableCell>
                  <TableCell>{record.department_name}</TableCell>
                  <TableCell>${record.base_salary.toLocaleString()}</TableCell>
                  <TableCell>${record.bonus.toLocaleString()}</TableCell>
                  <TableCell>${record.deductions.toLocaleString()}</TableCell>
                  <TableCell>${record.net_salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'paid' ? 'bg-green-100 text-green-800' :
                      record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(record.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(record)}>
                          Edit Record
                        </DropdownMenuItem>
                        <DropdownMenuItem>Generate Payslip</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Payroll Record</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="base_salary" className="text-right">
                  Base Salary
                </Label>
                <Input
                  id="base_salary"
                  type="number"
                  value={editingRecord.base_salary}
                  onChange={(e) => setEditingRecord({
                    ...editingRecord,
                    base_salary: parseFloat(e.target.value) || 0,
                    net_salary: (parseFloat(e.target.value) || 0) + editingRecord.bonus - editingRecord.deductions
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bonus" className="text-right">
                  Bonus
                </Label>
                <Input
                  id="bonus"
                  type="number"
                  value={editingRecord.bonus}
                  onChange={(e) => setEditingRecord({
                    ...editingRecord,
                    bonus: parseFloat(e.target.value) || 0,
                    net_salary: editingRecord.base_salary + (parseFloat(e.target.value) || 0) - editingRecord.deductions
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deductions" className="text-right">
                  Deductions
                </Label>
                <Input
                  id="deductions"
                  type="number"
                  value={editingRecord.deductions}
                  onChange={(e) => setEditingRecord({
                    ...editingRecord,
                    deductions: parseFloat(e.target.value) || 0,
                    net_salary: editingRecord.base_salary + editingRecord.bonus - (parseFloat(e.target.value) || 0)
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="net_salary" className="text-right">
                  Net Salary
                </Label>
                <Input
                  id="net_salary"
                  type="number"
                  value={editingRecord.net_salary}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingRecord.status}
                  onValueChange={(value: 'paid' | 'pending' | 'cancelled') => 
                    setEditingRecord({...editingRecord, status: value})
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_date" className="text-right">
                  Payment Date
                </Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={editingRecord.payment_date.split('T')[0]}
                  onChange={(e) => setEditingRecord({
                    ...editingRecord,
                    payment_date: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payroll; 