'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Jobs = dynamic(() => import('../../../src/pages/Admin/Jobs'), { ssr: false });

export default function JobsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Jobs />
    </ProtectedRoute>
  );
}
