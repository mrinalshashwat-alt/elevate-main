'use client';

import dynamic from 'next/dynamic';

const Technical = dynamic(() => import('../../../src/pages/User/Technical'), { ssr: false });

export default function TechnicalPage() {
  return <Technical />;
}


