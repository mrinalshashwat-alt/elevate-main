'use client';

import dynamic from 'next/dynamic';

const Jobs = dynamic(() => import('../../../src/pages/Admin/Jobs'), { ssr: false });

export default function JobsPage() {
  return <Jobs />;
}
