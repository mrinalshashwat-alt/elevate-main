'use client';

import dynamic from 'next/dynamic';

const Content = dynamic(() => import('../../../src/pages/User/ContentMUI'), { ssr: false });

export default function ContentPage() {
  return <Content />;
}
