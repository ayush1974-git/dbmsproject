
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const redirectPath = isAuthenticated ? "/dashboard" : "/";

  useEffect(() => {
    console.error("404 Error: Page not found");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <p className="text-2xl font-medium text-gray-900 mb-6">Page not found</p>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Button asChild>
          <Link to={redirectPath}>Return to {isAuthenticated ? "Dashboard" : "Login"}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
