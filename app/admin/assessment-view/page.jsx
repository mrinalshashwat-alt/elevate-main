'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const AssessmentView = dynamic(() => import('../../../src/views/Admin/AssessmentView'), { ssr: false });

export default function AssessmentViewPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AssessmentView />
    </ProtectedRoute>
  );
}


