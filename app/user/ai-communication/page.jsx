'use client';

import dynamic from 'next/dynamic';

const AICommunication = dynamic(() => import('../../../src/pages/User/AICommunication'), { ssr: false });

export default function AICommunicationPage() {
  return <AICommunication />;
}
