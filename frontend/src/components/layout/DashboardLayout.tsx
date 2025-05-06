import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu as MenuIcon, 
  Bell, 
  ChevronLeft,
  User,
  Building2,
  Wallet
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  text: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, text, to, active, onClick }: SidebarItemProps) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-blue-50 text-gray-700 hover:text-blue-600",
      active && "bg-blue-50 text-blue-600 font-medium"
    )}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span>{text}</span>
  </Link>
);

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const path = window.location.pathname;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { icon: LayoutDashboard, text: "Dashboard", to: "/dashboard" },
    { icon: Users, text: "Employees", to: "/employees" },
    { icon: FileText, text: "Documents", to: "/documents" },
    { icon: Calendar, text: "Time Off", to: "/timeoff" },
    { icon: Building2, text: "Departments", to: "/departments" },
    { icon: Wallet, text: "Payroll", to: "/payroll" },
    ...(user?.role === "admin" ? [{ icon: Settings, text: "Settings", to: "/settings" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b h-16 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left side - Menu trigger */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="md:inline-flex"
          >
            {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>

          {/* Center/Right - Logo */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-xl font-bold">Hire Sync</div>
            
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-5 w-5" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-5 w-5" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar - with animation */}
      <aside className={cn(
        "fixed top-16 left-0 bottom-0 w-64 bg-white border-r transition-transform duration-300 ease-in-out transform",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.text}
              icon={item.icon}
              text={item.text}
              to={item.to}
              active={path === item.to}
            />
          ))}
        </div>
      </aside>

      {/* Main Content - with transition */}
      <main className={cn(
        "pt-16 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "md:ml-64" : "md:ml-0"
      )}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
