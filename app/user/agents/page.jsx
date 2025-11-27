'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Agents = dynamic(() => import('../../../src/views/User/Agents'), { ssr: false });

export default function AgentsPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Agents />
    </ProtectedRoute>
  );
}
