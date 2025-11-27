'use client';

import dynamic from 'next/dynamic';

const AssessmentEnd = dynamic(() => import('../../../src/pages/User/AssessmentEnd'), { ssr: false });

export default function AssessmentEndPage() {
  return <AssessmentEnd />;
}


