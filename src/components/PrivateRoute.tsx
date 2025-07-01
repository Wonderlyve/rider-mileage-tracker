
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredType?: 'rider' | 'admin';
}

export function PrivateRoute({ children, requiredType }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredType && user.type !== requiredType) {
    return <Navigate to={user.type === 'admin' ? '/admin/dashboard' : '/rider/home'} replace />;
  }

  return <>{children}</>;
}
