import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, dbFirestore } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  employeeId?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(dbFirestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              username: userData.username || firebaseUser.displayName || 'No Name',
              email: firebaseUser.email || '',
              role: userData.role || 'user',
              phone: userData.phone,
              employeeId: userData.employeeId,
              status: userData.status
            });
          } else {
            // Fallback for missing document
            setUser({
              id: firebaseUser.uid,
              username: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || '',
              role: 'user',
            });
          }
        } catch (error) {
          console.error("Auth context error:", error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
