'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Test = dynamic(() => import('../../../src/pages/User/Test'), { ssr: false });

export default function TestPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Test />
    </ProtectedRoute>
  );
}
