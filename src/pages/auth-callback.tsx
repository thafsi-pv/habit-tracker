import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallback() {
  const { user, isLoading, refetch } = useAuth();

  React.useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Signing you in…</div>;
  }

  return <Navigate to={user ? '/' : '/login'} replace />;
}
