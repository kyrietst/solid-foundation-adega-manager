import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee' | 'delivery' | Array<'admin' | 'employee' | 'delivery'>;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole) {
    const roleHierarchy = {
      admin: 3,
      employee: 2,
      delivery: 1
    };

    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    } else {
      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};
