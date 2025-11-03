'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const MockPrep = dynamic(() => import('../../../src/pages/User/MockPrepMUI'), { ssr: false });

export default function MockPrepPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <MockPrep />
    </ProtectedRoute>
  );
}
