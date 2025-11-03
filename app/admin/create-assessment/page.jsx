'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const CreateAssessment = dynamic(() => import('../../../src/pages/Admin/CreateAssessment'), { ssr: false });

export default function CreateAssessmentPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateAssessment />
    </ProtectedRoute>
  );
}
