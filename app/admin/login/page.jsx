'use client';

import dynamic from 'next/dynamic';

const AdminLogin = dynamic(() => import('../../../src/pages/Auth/AdminLogin'), {
  ssr: false
});

export default function AdminLoginPage() {
  return <AdminLogin />;
}
