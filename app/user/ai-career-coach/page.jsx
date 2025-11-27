'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const AICareerCoach = dynamic(() => import('../../../src/views/User/AICareerCoach'), { ssr: false });

export default function AICareerCoachPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <AICareerCoach />
    </ProtectedRoute>
  );
}
