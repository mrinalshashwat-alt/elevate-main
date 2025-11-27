'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (requiredRole === 'admin') {
    return <>{children}</>;
  }

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/?auth=required');
      return;
    }

    if (requiredRole && user?.role && user.role !== requiredRole) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, requiredRole, router, user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm uppercase tracking-[0.3em]">Checking access…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
