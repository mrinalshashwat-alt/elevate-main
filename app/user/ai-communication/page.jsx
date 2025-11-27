'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const AICommunication = dynamic(() => import('../../../src/views/User/AICommunication'), { ssr: false });

export default function AICommunicationPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <AICommunication />
    </ProtectedRoute>
  );
}
