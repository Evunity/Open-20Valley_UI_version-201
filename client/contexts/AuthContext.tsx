import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_SESSION_KEY = "ov_auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(AUTH_SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed?.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Simple validation - in production, this would call an API
    if (username && password) {
      setIsAuthenticated(true);
      localStorage.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify({
          isAuthenticated: true,
          username,
          loginAt: new Date().toISOString(),
        })
      );
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
