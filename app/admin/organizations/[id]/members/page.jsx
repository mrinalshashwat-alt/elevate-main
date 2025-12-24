'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../../src/routes/ProtectedRoute';

const OrganizationMembers = dynamic(() => import('../../../../../src/pages/Admin/OrganizationMembers'), { ssr: false });

export default function OrganizationMembersPage() {
  const params = useParams();
  const organizationId = params.id;

  return (
    <ProtectedRoute requiredRole="admin">
      <OrganizationMembers organizationId={organizationId} />
    </ProtectedRoute>
  );
}
