'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const ManageUsers = dynamic(() => import('../../../src/views/Admin/ManageUsers'), { ssr: false });

export default function ManageUsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ManageUsers />
    </ProtectedRoute>
  );
}
