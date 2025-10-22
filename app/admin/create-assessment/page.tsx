'use client';

import dynamic from 'next/dynamic';

const CreateAssessment = dynamic(() => import('../../../src/pages/Admin/CreateAssessment'), { ssr: false });

export default function CreateAssessmentPage() {
  return <CreateAssessment />;
}
