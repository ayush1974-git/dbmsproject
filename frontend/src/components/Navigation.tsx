import { Link } from 'react-router-dom';
import { Users, Home, Users as Employees, FileText, Calendar, Building2, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { isAdmin } = useAuth();

  return (
    <nav className="flex flex-col gap-2">
      <Link
        to="/dashboard"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>

      <Link
        to="/employees"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Employees className="h-4 w-4" />
        Employees
      </Link>

      <Link
        to="/departments"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Building2 className="h-4 w-4" />
        Departments
      </Link>

      <Link
        to="/documents"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <FileText className="h-4 w-4" />
        Documents
      </Link>

      <Link
        to="/timeoff"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Calendar className="h-4 w-4" />
        Time Off
      </Link>

      <Link
        to="/payroll"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <DollarSign className="h-4 w-4" />
        Payroll
      </Link>

      {isAdmin() && (
        <Link
          to="/user-management"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Users className="h-4 w-4" />
          User Management
        </Link>
      )}
    </nav>
  );
} 