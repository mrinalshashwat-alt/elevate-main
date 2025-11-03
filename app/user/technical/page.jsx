'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Technical = dynamic(() => import('../../../src/pages/User/Technical'), { ssr: false });

export default function TechnicalPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Technical />
    </ProtectedRoute>
  );
}


