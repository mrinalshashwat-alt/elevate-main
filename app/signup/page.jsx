'use client';

import nextDynamic from 'next/dynamic';

const Signup = nextDynamic(() => import('../../src/components/Auth/Signup'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  ),
});

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return <Signup />;
}














































