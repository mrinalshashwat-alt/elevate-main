'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAssessments, deleteAssessment } from '../../api/admin';

const AssessmentList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['adminAssessments'],
    queryFn: () => getAssessments(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
  });

  const handleDelete = (assessmentId) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      deleteMutation.mutate(assessmentId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push('/admin/dashboard')} className="flex items-center space-x-2 hover:text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <button
            onClick={() => router.push('/admin/create-assessment')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Create Assessment
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading assessments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentsData?.data.map((assessment) => (
              <div key={assessment.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{assessment.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    assessment.status === 'published' ? 'bg-green-500/20 text-green-400' :
                    assessment.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {assessment.status}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{assessment.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold">{assessment.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Questions:</span>
                    <span className="font-semibold">{assessment.questions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Created:</span>
                    <span className="font-semibold">{new Date(assessment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/create-assessment`)}
                    className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(assessment.id)}
                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && assessmentsData?.data.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 mb-4">No assessments created yet</p>
            <button
              onClick={() => router.push('/admin/create-assessment')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Create Your First Assessment
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssessmentList;
