'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const AssessmentResults = dynamic(() => import('../../../src/pages/Admin/AssessmentResults'), { ssr: false });

export default function AssessmentResultsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AssessmentResults />
    </ProtectedRoute>
  );
}

