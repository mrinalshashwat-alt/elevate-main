'use client';

import dynamic from 'next/dynamic';

const Assessment = dynamic(() => import('../../../src/pages/User/Assessment'), { ssr: false });

export default function AssessmentPage() {
  return <Assessment />;
}




