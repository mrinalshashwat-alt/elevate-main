'use client';

import dynamic from 'next/dynamic';

const Courses = dynamic(() => import('../../../src/pages/User/Courses'), { ssr: false });

export default function CoursesPage() {
  return <Courses />;
}
