import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading, isAuthorized } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !isAuthorized(requiredRoles)) {
    // Save the attempted URL for redirection after login
    const searchParams = new URLSearchParams();
    searchParams.set('redirect', location.pathname + location.search);
    
    return <Navigate to={`${redirectTo}?${searchParams.toString()}`} replace />;
  }

  return <>{children}</>;
}
