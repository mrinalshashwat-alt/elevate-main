'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const UserDashboard = dynamic(() => import('../../../src/views/User/Dashboard'), { ssr: false });

export default function UserDashboardPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <UserDashboard />
    </ProtectedRoute>
  );
}
