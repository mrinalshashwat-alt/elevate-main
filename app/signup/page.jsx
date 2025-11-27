import dynamic from 'next/dynamic';

const Signup = dynamic(() => import('../../src/pages/Auth/Signup'), {
  ssr: false,
});

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign Up • ElevateCareer',
  description: 'Create your ElevateCareer account and unlock AI-powered career tools.',
};

export default function SignupPage() {
  return <Signup />;
}














































