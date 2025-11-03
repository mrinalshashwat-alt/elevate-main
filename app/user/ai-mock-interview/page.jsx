'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const AIMockInterview = dynamic(() => import('../../../src/pages/User/AIMockInterview'), { ssr: false });

export default function AIMockInterviewPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <AIMockInterview />
    </ProtectedRoute>
  );
}
