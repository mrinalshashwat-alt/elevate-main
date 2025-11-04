'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const Courses = dynamic(() => import('../../../src/views/User/Courses'), { ssr: false });

export default function CoursesPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Courses />
    </ProtectedRoute>
  );
}
