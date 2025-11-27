'use client';

import dynamic from 'next/dynamic';

const AssessmentSummary = dynamic(() => import('../../../src/views/User/AssessmentSummary'), { ssr: false });

export default function AssessmentSummaryPage() {
  return <AssessmentSummary />;
}




























