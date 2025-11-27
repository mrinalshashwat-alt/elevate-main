'use client';

import dynamic from 'next/dynamic';

const AssessmentEnd = dynamic(() => import('../../../src/views/User/AssessmentEnd'), { ssr: false });

export default function AssessmentEndPage() {
  return <AssessmentEnd />;
}


