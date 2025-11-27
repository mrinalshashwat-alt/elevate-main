'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getAssessment, getAssessments } from '../../api/admin';
import { FiArrowLeft, FiEdit, FiTrash2, FiCopy, FiExternalLink, FiClock, FiFileText, FiUsers, FiCheckCircle, FiLink, FiTarget } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';

const AssessmentView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  
  const [assessmentUrl, setAssessmentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch single assessment details
  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getAssessment(assessmentId),
    enabled: !!assessmentId,
  });

  useEffect(() => {
    if (assessment?.unique_link_token) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${baseUrl}/user/assessment-start?token=${assessment.unique_link_token}`;
      setAssessmentUrl(url);
    }
  }, [assessment]);

  const handleCopyUrl = () => {
    if (assessmentUrl) {
      navigator.clipboard.writeText(assessmentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/assessment-edit?id=${assessmentId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      // TODO: Call delete API
      router.push('/admin/assessment-list');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Assessment View">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading assessment...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !assessment) {
    return (
      <AdminLayout title="Assessment View">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-400 mb-4">Failed to load assessment</p>
            <button
              onClick={() => router.push('/admin/assessment-list')}
              className="px-4 py-2 bg-orange-500 rounded-lg text-white"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const isPublished = assessment.status === 'published';
  const isDraft = assessment.status === 'draft';

  return (
    <AdminLayout 
      title="Assessment View"
      breadcrumbs={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Assessments', path: '/admin/assessment-list' },
        { label: assessment?.name || 'Assessment View' }
      ]}
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">{assessment?.name || 'Assessment View'}</h1>
          <p className="text-gray-400">View assessment details and manage settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-all"
          >
            <FiEdit />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all"
          >
            <FiTrash2 />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Assessment Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/90 border border-[#FF5728] rounded-3xl p-8 mb-6"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{assessment.name}</h1>
            <p className="text-gray-400 text-lg">{assessment.description || 'No description'}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            assessment.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            assessment.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {(assessment.status || 'draft').toUpperCase()}
          </span>
        </div>

        {/* Assessment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <FiClock />
              <span className="text-sm">Duration</span>
            </div>
            <p className="text-2xl font-bold">{assessment.duration_minutes || 60} min</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <FiFileText />
              <span className="text-sm">Questions</span>
            </div>
            <p className="text-2xl font-bold">{assessment.question_count || 0}</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <FiTarget />
              <span className="text-sm">Competencies</span>
            </div>
            <p className="text-2xl font-bold">{assessment.competency_count || assessment.competencies?.length || 0}</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <FiUsers />
              <span className="text-sm">Submissions</span>
            </div>
            <p className="text-2xl font-bold">{assessment.total_submissions || 0}</p>
          </div>
        </div>

        {/* Role/Job Info */}
        {(assessment.job_title_name || assessment.job_title) && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <FiFileText />
                  <span className="text-sm">Linked Role</span>
                </div>
                <p className="text-xl font-semibold">{assessment.job_title_name || 'Role'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Competencies */}
        {assessment.competencies && assessment.competencies.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Competencies Tested</h3>
            <div className="flex flex-wrap gap-2">
              {assessment.competencies.map((comp, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                    comp.competency_category === 'technical' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    comp.competency_category === 'behavioral' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  }`}
                >
                  {comp.competency_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Question Distribution */}
        {assessment.question_distribution && Object.keys(assessment.question_distribution).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Question Types</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(assessment.question_distribution).map(([type, count], idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium border border-orange-500/30"
                >
                  {type.toUpperCase()}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assessment URL - Only show for published assessments */}
        {isPublished && assessmentUrl && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 text-gray-400 mb-3">
              <FiLink />
              <span className="text-sm font-semibold">Assessment Link</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={assessmentUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleCopyUrl}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-all"
              >
                {copied ? (
                  <>
                    <FiCheckCircle className="text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <a
                href={assessmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-all"
              >
                <FiExternalLink />
                <span>Open</span>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with candidates to take the assessment
            </p>
          </div>
        )}

        {/* Draft Notice */}
        {isDraft && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm">
              <strong>Draft Assessment:</strong> This assessment is not yet published. 
              Add questions and competencies, then publish to make it available to candidates.
            </p>
            <button
              onClick={handleEdit}
              className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-all"
            >
              Continue Editing
            </button>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {/* Only show View Candidates/Results for published assessments with submissions */}
            {isPublished && (
              <>
                <button
                  onClick={() => router.push(`/admin/candidates?assessmentId=${assessmentId}`)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                >
                  <span>View Candidates</span>
                  <FiUsers />
                </button>
                <button
                  onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}`)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                >
                  <span>View Results</span>
                  <FiCheckCircle />
                </button>
              </>
            )}
            <button
              onClick={handleEdit}
              className="w-full flex items-center justify-between px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-all"
            >
              <span>Edit Assessment</span>
              <FiEdit />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4">Assessment Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span>{assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`${
                assessment.status === 'published' ? 'text-green-400' :
                assessment.status === 'draft' ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {(assessment.status || 'draft').toUpperCase()}
              </span>
            </div>
            {assessment.start_at && (
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date:</span>
                <span>{new Date(assessment.start_at).toLocaleDateString()}</span>
              </div>
            )}
            {assessment.end_at && (
              <div className="flex justify-between">
                <span className="text-gray-400">End Date:</span>
                <span>{new Date(assessment.end_at).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Total Marks:</span>
              <span>{assessment.total_marks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ID:</span>
              <span className="font-mono text-xs">{assessment.id?.slice(0, 8)}...</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AssessmentView;
