'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getJobs, createDraftJob, deleteJob } from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiUsers, FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';

const Jobs = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: () => getJobs(1, 100),
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
      const result = await createDraftJob();
      router.push(`/admin/jobs/edit?id=${result.id}`);
    } catch (error) {
      console.error('Failed to create draft job:', error);
      alert(`Failed to create job: ${error.response?.data?.error || error.response?.data?.message || error.message}`);
    }
  };

  const handleJobClick = (jobId) => {
    router.push(`/admin/jobs/edit?id=${jobId}`);
  };

  const handleDeleteClick = (e, jobId) => {
    e.stopPropagation();
    setShowDeleteConfirm(jobId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm);
    }
  };

  // Filter jobs based on search and status
  const filteredJobs = jobsData?.data?.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status) => {
    const statusStyles = {
      published: 'bg-green-500/20 text-green-400 border-green-500/30',
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      archived: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return statusStyles[status] || statusStyles.draft;
  };

  const getJobTypeLabel = (type) => {
    const typeLabels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance',
    };
    return typeLabels[type] || type || 'Full Time';
  };

  return (
    <AdminLayout title="Jobs">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Manage Jobs</h1>
            <p className="text-gray-400">Create and manage job postings with competencies and assessments</p>
          </div>
          <button
            onClick={handleCreateNewJob}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95 flex items-center gap-2 self-start"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create New Job</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
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
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <FiBriefcase className="w-20 h-20 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No jobs found' : 'No jobs yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first job posting'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={handleCreateNewJob}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Create Your First Job
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job.id)}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-orange-400 transition-colors truncate">
                      {job.title || 'Untitled Job'}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">{job.company || 'Job Title Not Set'}</p>
                  </div>
                  <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(job.status)}`}>
                    {(job.status || 'draft').charAt(0).toUpperCase() + (job.status || 'draft').slice(1)}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <FiMapPin className="w-4 h-4 mr-3 flex-shrink-0 text-orange-400/70" />
                    <span className="truncate">{job.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <FiClock className="w-4 h-4 mr-3 flex-shrink-0 text-blue-400/70" />
                    <span>{getJobTypeLabel(job.type)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <FiDollarSign className="w-4 h-4 mr-3 flex-shrink-0 text-green-400/70" />
                    <span className="truncate">{job.salary || 'Not specified'}</span>
                  </div>
                </div>

                {/* Competencies */}
                {job.competencies && job.competencies.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiUsers className="w-4 h-4 text-purple-400/70" />
                      <span className="text-xs text-gray-500 font-medium">Competencies</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.competencies.slice(0, 3).map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
                        >
                          {comp}
                        </span>
                      ))}
                      {job.competencies.length > 3 && (
                        <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-400">
                          +{job.competencies.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-500">
                    {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Draft'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job.id);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      title="Edit job"
                    >
                      <FiEdit2 className="w-4 h-4 text-gray-400 hover:text-orange-400 transition-colors" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, job.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Delete job"
                    >
                      <FiTrash2 className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" />
                    </button>
                  </div>
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
