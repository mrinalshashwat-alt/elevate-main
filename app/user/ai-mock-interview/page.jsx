'use client';

import dynamic from 'next/dynamic';

const AIMockInterview = dynamic(() => import('../../../src/pages/User/AIMockInterview'), { ssr: false });

export default function AIMockInterviewPage() {
  return <AIMockInterview />;
}
