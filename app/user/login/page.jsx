'use client';

import dynamic from 'next/dynamic';

const UserLogin = dynamic(() => import('../../../src/pages/Auth/UserLogin'), {
  ssr: false
});

export default function UserLoginPage() {
  return <UserLogin />;
}
