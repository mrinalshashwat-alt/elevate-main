'use client';

import dynamic from 'next/dynamic';

const AssessmentList = dynamic(() => import('../../../src/pages/Admin/AssessmentList'), { ssr: false });

export default function AssessmentListPage() {
  return <AssessmentList />;
}
