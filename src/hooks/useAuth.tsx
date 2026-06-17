import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AdminUser } from '@/lib/types';
import { adminLogin as apiLogin } from '@/lib/api';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('chronicle-admin-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('chronicle-admin-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const adminUser = await apiLogin(email, password);
      if (adminUser) {
        setUser(adminUser);
        localStorage.setItem('chronicle-admin-user', JSON.stringify(adminUser));
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chronicle-admin-user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
