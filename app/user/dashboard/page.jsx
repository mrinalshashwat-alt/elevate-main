'use client';

import dynamic from 'next/dynamic';

const UserDashboard = dynamic(() => import('../../../src/pages/User/Dashboard'), { ssr: false });

export default function UserDashboardPage() {
  return <UserDashboard />;
}
