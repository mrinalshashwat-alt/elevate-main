'use client';

import dynamic from 'next/dynamic';

const Content = dynamic(() => import('../../../src/pages/User/Content'), { ssr: false });

export default function ContentPage() {
  return <Content />;
}
