'use client';

import dynamic from 'next/dynamic';

const ForgotPassword = dynamic(() => import('../../../src/pages/Auth/ForgotPassword'), {
  ssr: false
});

export default function AdminForgotPasswordPage() {
  return <ForgotPassword portal="admin" />;
}
