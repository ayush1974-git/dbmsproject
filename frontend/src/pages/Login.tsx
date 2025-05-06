import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Building2, User, Lock, Users, Briefcase, FileText, Calendar, CheckCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Success",
          description: "Login successful!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Invalid username or password. Try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-1/4 animate-float-slow">
          <Users className="h-8 w-8 text-blue-200" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float">
          <Briefcase className="h-8 w-8 text-indigo-200" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float-slow">
          <FileText className="h-8 w-8 text-blue-200" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-float">
          <Calendar className="h-8 w-8 text-indigo-200" />
        </div>
        <div className="absolute top-1/2 left-1/2 animate-float-slow">
          <CheckCircle className="h-8 w-8 text-blue-200" />
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-blue-600 mb-2">HireSync</h1>
          <p className="text-gray-600">Your Complete HR Management Solution</p>
        </div>
        
        <Card className="w-full shadow-lg backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              © 2024 HireSync. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
