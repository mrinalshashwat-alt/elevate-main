'use client';

import dynamic from 'next/dynamic';

const ForgotPassword = dynamic(() => import('../../../src/pages/Auth/ForgotPassword'), {
  ssr: false
});

export default function UserForgotPasswordPage() {
  return <ForgotPassword portal="user" />;
}
