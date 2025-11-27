'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const AssessmentList = dynamic(() => import('../../../src/views/Admin/AssessmentList'), { ssr: false });

export default function AssessmentListPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AssessmentList />
    </ProtectedRoute>
  );
}
