import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define user roles type
type UserRole = "admin" | "hr";

interface User {
  id: string;
  username: string;
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isHR: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Check if user is authenticated on initial load
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const isAdmin = () => user?.role === "admin";
  const isHR = () => user?.role === "hr";

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      isAdmin,
      isHR
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
