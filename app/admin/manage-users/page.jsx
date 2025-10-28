'use client';

import dynamic from 'next/dynamic';

const ManageUsers = dynamic(() => import('../../../src/pages/Admin/ManageUsers'), { ssr: false });

export default function ManageUsersPage() {
  return <ManageUsers />;
}
