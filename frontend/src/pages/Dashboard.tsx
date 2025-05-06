import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  CalendarClock,
  TrendingUp,
  Briefcase,
  FileText,
  Settings,
  Shield,
  BarChart3,
  Building2,
  Loader2,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Department {
  id: string;
  name: string;
  description: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    systemUsers: 2, // Fixed at 2 as requested
    totalDepartments: 0,
    systemHealth: "100%"
  });
  
  // Admin specific stats
  const adminStats = [
    {
      title: "Total Employees",
      value: stats.totalEmployees.toString(),
      icon: Users,
      trend: "Real-time count",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "System Users",
      value: stats.systemUsers.toString(),
      icon: Shield,
      trend: "Fixed at 2 users",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Departments",
      value: stats.totalDepartments.toString(),
      icon: Building2,
      trend: "Real-time count",
      color: "bg-green-50 text-green-600"
    },
    {
      title: "System Health",
      value: stats.systemHealth,
      icon: BarChart3,
      trend: "All systems operational",
      color: "bg-amber-50 text-amber-600"
    },
  ];

  // HR specific stats
  const hrStats = [
    {
      title: "Total Employees",
      value: stats.totalEmployees.toString(),
      icon: Users,
      trend: "Real-time count",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "New Hires",
      value: "0",
      icon: UserPlus,
      trend: "No new hires this week",
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Time Off Requests",
      value: "0",
      icon: CalendarClock,
      trend: "No pending requests",
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Open Positions",
      value: "0",
      icon: Briefcase,
      trend: "No open positions",
      color: "bg-purple-50 text-purple-600"
    },
  ];
  
  // Admin specific activities
  const adminActivities = [
    { 
      id: 1, 
      action: "System backup completed successfully", 
      timestamp: "1 hour ago" 
    },
    { 
      id: 2, 
      action: "New department 'Research & Development' created", 
      timestamp: "3 hours ago" 
    },
    { 
      id: 3, 
      action: "Database optimization performed", 
      timestamp: "Yesterday" 
    },
    { 
      id: 4, 
      action: "Security audit completed", 
      timestamp: "2 days ago" 
    },
    { 
      id: 5, 
      action: "System update scheduled", 
      timestamp: "3 days ago" 
    }
  ];

  // HR specific activities
  const hrActivities = [
    { 
      id: 1, 
      action: "Mark Johnson submitted a time off request", 
      timestamp: "1 hour ago" 
    },
    { 
      id: 2, 
      action: "Sarah Davis was added as a new employee", 
      timestamp: "3 hours ago" 
    },
    { 
      id: 3, 
      action: "Performance review for Dev Team scheduled", 
      timestamp: "Yesterday" 
    },
    { 
      id: 4, 
      action: "Benefits enrollment period started", 
      timestamp: "2 days ago" 
    },
    { 
      id: 5, 
      action: "Updated company holiday calendar", 
      timestamp: "3 days ago" 
    }
  ];

  // Admin specific quick actions
  const adminQuickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove system users",
      icon: Users,
      action: () => navigate('/user-management')
    },
    {
      title: "View System Logs",
      description: "Access system activity logs",
      icon: FileText,
      action: () => navigate('/settings/logs')
    },
    {
      title: "System Configuration",
      description: "Configure system settings and preferences",
      icon: Settings,
      action: () => navigate('/settings')
    },
    {
      title: "Database Management",
      description: "Manage database backups and maintenance",
      icon: BarChart3,
      action: () => navigate('/settings/database')
    }
  ];

  // HR specific quick actions
  const hrQuickActions = [
    {
      title: "Add New Employee",
      description: "Add a new employee to the system",
      icon: UserPlus,
      action: () => navigate('/employees')
    },
    {
      title: "Manage Time Off",
      description: "View and manage time off requests",
      icon: CalendarClock,
      action: () => navigate('/timeoff')
    },
    {
      title: "View Documents",
      description: "Access and manage company documents",
      icon: FileText,
      action: () => navigate('/documents')
    },
    {
      title: "Department Overview",
      description: "View and manage departments",
      icon: Building2,
      action: () => navigate('/departments')
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch departments
        const departmentsResponse = await fetch('http://localhost:5000/api/departments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!departmentsResponse.ok) {
          throw new Error('Failed to fetch departments');
        }
        
        const departmentsData = await departmentsResponse.json();
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        
        // Fetch employees
        const employeesResponse = await fetch('http://localhost:5000/api/employees', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!employeesResponse.ok) {
          throw new Error('Failed to fetch employees');
        }
        
        const employeesData = await employeesResponse.json();
        
        // Update stats
        setStats({
          totalEmployees: employeesData.length,
          systemUsers: 2, // Fixed at 2 as requested
          totalDepartments: departmentsData.length,
          systemHealth: "100%"
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const isAdmin = user?.role === 'admin';
  const statsArray = isAdmin ? adminStats : hrStats;
  const activities = isAdmin ? adminActivities : hrActivities;
  const quickActions = isAdmin ? adminQuickActions : hrQuickActions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.username || 'User'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Here's what's happening in your admin dashboard today."
              : "Here's what's happening in your HR dashboard today."}
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsArray.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <div className="flex items-baseline">
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Departments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {departments && departments.length > 0 ? (
              departments.map((department) => (
                <Card key={department.id} className="hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{department.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {department.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No departments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6" onClick={action.action}>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-full p-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 bg-gray-50 p-3 rounded-lg">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <Card className="col-span-full lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isAdmin ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage Used</span>
                    <span className="font-medium">45%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Approvals</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Recruitments</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Upcoming Reviews</span>
                    <span className="font-medium">5</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
