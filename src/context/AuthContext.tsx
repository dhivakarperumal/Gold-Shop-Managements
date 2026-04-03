import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  role: 'Admin' | 'Staff'; 
};

interface AuthContextType {
  user: User | null;
  login: (name: string, role: 'Admin' | 'Staff') => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const stored = localStorage.getItem('gold_app_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (name: string, role: 'Admin' | 'Staff') => {
    const u = { id: Math.random().toString(), name, role };
    setUser(u);
    localStorage.setItem('gold_app_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gold_app_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
