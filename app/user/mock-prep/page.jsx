'use client';

import dynamic from 'next/dynamic';

const MockPrep = dynamic(() => import('../../../src/pages/User/MockPrepMUI'), { ssr: false });

export default function MockPrepPage() {
  return <MockPrep />;
}
