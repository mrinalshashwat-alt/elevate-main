'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const CreateQuestions = dynamic(() => import('../../../src/views/Admin/CreateQuestions'), { ssr: false });

export default function CreateQuestionsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateQuestions />
    </ProtectedRoute>
  );
}


