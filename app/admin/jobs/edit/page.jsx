'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../../src/routes/ProtectedRoute';

const JobEdit = dynamic(() => import('../../../../src/pages/Admin/JobEdit'), { ssr: false });

export default function JobEditPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <JobEdit />
    </ProtectedRoute>
  );
}
