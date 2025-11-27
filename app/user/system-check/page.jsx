'use client';

import dynamic from 'next/dynamic';

const SystemCheck = dynamic(() => import('../../../src/views/User/SystemCheck'), { ssr: false });

export default function SystemCheckPage() {
  return <SystemCheck />;
}

