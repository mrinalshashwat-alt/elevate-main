import { Suspense } from 'react';
import Home from '../src/views/Home/Home';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <Home />
    </Suspense>
  );
}
