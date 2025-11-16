'use client';

import dynamic from 'next/dynamic';

const AssessmentStart = dynamic(() => import('../../../src/pages/User/AssessmentStart'), { ssr: false });

export default function AssessmentStartPage() {
  return <AssessmentStart />;
}


