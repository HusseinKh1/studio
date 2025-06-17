
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'User')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        // If user is admin and trying to access non-admin page (if specific), or vice-versa
        // For simplicity, redirect to home if role not allowed. Better UX might be an "Access Denied" page.
        router.push('/'); 
      }
    }

  }, [user, isLoading, isAuthenticated, isAdmin, allowedRoles, router]);

  if (isLoading || !isAuthenticated()) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (allowedRoles && allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] text-center p-4">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/')}>Go to Homepage</Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
