'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Management = dynamic(() => import('../../../src/views/User/Management'), { ssr: false });

export default function ManagementPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Management />
    </ProtectedRoute>
  );
}


