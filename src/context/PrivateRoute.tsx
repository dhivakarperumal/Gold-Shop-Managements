import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loader from '../components/CommonComponents/Loader';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function PrivateRoute({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
