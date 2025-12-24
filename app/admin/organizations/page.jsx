'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Organizations = dynamic(() => import('../../../src/pages/Admin/Organizations'), { ssr: false });

export default function OrganizationsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Organizations />
    </ProtectedRoute>
  );
}
