'use client';

import dynamic from 'next/dynamic';

const Test = dynamic(() => import('../../../src/pages/User/Test'), { ssr: false });

export default function TestPage() {
  return <Test />;
}
