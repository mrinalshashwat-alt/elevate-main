'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Settings = dynamic(() => import('../../../src/views/User/Settings'), { ssr: false });

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Settings />
    </ProtectedRoute>
  );
}



