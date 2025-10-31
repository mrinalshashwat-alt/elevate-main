'use client';

import dynamic from 'next/dynamic';

const Management = dynamic(() => import('../../../src/pages/User/Management'), { ssr: false });

export default function ManagementPage() {
  return <Management />;
}


