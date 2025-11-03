'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const CandidatesList = dynamic(() => import('../../../src/pages/Admin/CandidatesList'), { ssr: false });

export default function CandidatesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CandidatesList />
    </ProtectedRoute>
  );
}


