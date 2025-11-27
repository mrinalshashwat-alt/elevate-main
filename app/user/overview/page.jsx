'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Overview = dynamic(() => import('../../../src/views/User/Overview'), { ssr: false });

export default function OverviewPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Overview />
    </ProtectedRoute>
  );
}



