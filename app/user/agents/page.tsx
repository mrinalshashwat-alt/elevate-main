'use client';

import dynamic from 'next/dynamic';

const Agents = dynamic(() => import('../../../src/pages/User/Agents'), { ssr: false });

export default function AgentsPage() {
  return <Agents />;
}
