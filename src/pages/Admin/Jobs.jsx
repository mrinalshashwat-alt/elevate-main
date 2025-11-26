'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getJobs, createDraftJob, deleteJob } from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';

const Jobs = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: getJobs,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      setShowDeleteConfirm(null);
    },
  });

  const handleCreateNewJob = async () => {
    try {
      console.log('Creating draft job...');
      const result = await createDraftJob();
      console.log('Draft job created:', result);
      // Navigate to edit page
      const editUrl = `/admin/jobs/edit?id=${result.id}`;
      console.log('Navigating to:', editUrl);
      window.location.href = editUrl;
    } catch (error) {
      console.error('Failed to create draft job:', error);
      alert(`Failed to create job: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleJobClick = (jobId) => {
    router.push(`/admin/jobs/edit?id=${jobId}`);
  };

  const handleDeleteClick = (e, jobId) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteConfirm(jobId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm);
    }
  };

  return (
    <AdminLayout title="Jobs">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Manage Jobs</h1>
          <p className="text-gray-400">Create and manage job postings</p>
        </div>
        <button
          onClick={handleCreateNewJob}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create New Job</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <p className="font-semibold">Error loading jobs</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}

      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading jobs...</p>
          </div>
        ) : jobsData?.data?.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No jobs yet</h3>
            <p className="text-gray-400 mb-6">Get started by creating your first job posting</p>
            <button
              onClick={handleCreateNewJob}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsData?.data.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job.id)}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-orange-400 transition-colors">{job.title}</h3>
                    <p className="text-gray-400 text-sm">{job.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'active' || job.status === 'published' ? 'bg-green-500/20 text-green-400' :
                    job.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    job.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {job.status || 'draft'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location || 'Remote'}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.type || 'Full-time'}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.salary || 'Competitive'}
                  </div>
                  {job.competencies && job.competencies.length > 0 && (
                    <div className="flex items-start text-sm text-gray-400 mt-3">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs line-clamp-1">{job.competencies.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-500">
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => handleDeleteClick(e, job.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all group/delete"
                    title="Delete job"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover/delete:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-white">Delete Job?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all text-red-400 font-semibold disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Jobs;
