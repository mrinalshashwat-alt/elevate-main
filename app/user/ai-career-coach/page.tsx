'use client';

import dynamic from 'next/dynamic';

const AICareerCoach = dynamic(() => import('../../../src/pages/User/AICareerCoach'), { ssr: false });

export default function AICareerCoachPage() {
  return <AICareerCoach />;
}
