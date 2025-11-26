'use client';

import { Suspense } from 'react';
import Home from '../src/pages/Home/Home';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
