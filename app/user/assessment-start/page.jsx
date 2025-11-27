'use client';

import dynamic from 'next/dynamic';

const AssessmentStart = dynamic(() => import('../../../src/views/User/AssessmentStart'), { ssr: false });

export default function AssessmentStartPage() {
  return <AssessmentStart />;
}


