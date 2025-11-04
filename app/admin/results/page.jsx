'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Results = dynamic(() => import('../../../src/views/Admin/Results'), { ssr: false });

export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Results />
    </ProtectedRoute>
  );
}


