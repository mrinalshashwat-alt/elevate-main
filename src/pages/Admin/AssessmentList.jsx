'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter, FiClock, FiUsers, FiFileText, FiExternalLink, FiCopy } from 'react-icons/fi';
import { getAssessments, deleteAssessment, createDraftAssessment } from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';

const AssessmentList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(null);

  const { data: assessmentsData, isLoading, error } = useQuery({
    queryKey: ['adminAssessments'],
    queryFn: () => getAssessments(1, 100),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
  });

  const createDraftMutation = useMutation({
    mutationFn: createDraftAssessment,
    onSuccess: (data) => {
      // Redirect to new edit page with the assessment ID
      console.log('Draft assessment created:', data);
      router.push(`/admin/assessment-edit?id=${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create draft assessment:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Fallback to old create page
      router.push('/admin/create-assessment');
    },
  });

  const handleNewAssessment = () => {
    console.log('Creating draft assessment...');
    createDraftMutation.mutate({ name: 'Untitled Assessment' });
  };

  const handleDelete = (assessmentId) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      deleteMutation.mutate(assessmentId);
    }
  };

  const handleCopyLink = (assessmentId) => {
    const link = `${window.location.origin}/user/assessment-start?id=${assessmentId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(assessmentId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Filter assessments
  const allAssessments = assessmentsData?.data || [];
  
  const activeAssessments = allAssessments.filter(a => 
    a.status === 'published' || a.status === 'draft' || a.status === 'active'
  );
  
  const completedAssessments = allAssessments.filter(a => 
    a.status === 'archived' || a.status === 'completed'
  );

  const currentAssessments = activeSection === 'active' ? activeAssessments : completedAssessments;

  // Apply search and status filters
  const filteredAssessments = currentAssessments.filter(assessment => {
    const matchesSearch = !searchQuery ||
      assessment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.jobTitleName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      published: 'bg-green-500/20 text-green-400 border-green-500/30',
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return statusStyles[status] || statusStyles.draft;
  };

  return (
    <AdminLayout title="Assessments">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Manage Assessments</h1>
            <p className="text-gray-400">Create and manage AI-driven assessments for your organization</p>
          </div>
          <button
            onClick={handleNewAssessment}
            disabled={createDraftMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95 flex items-center gap-2 self-start disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createDraftMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FiPlus className="w-5 h-5" />
            )}
            <span>{createDraftMutation.isPending ? 'Creating...' : 'New Assessment'}</span>
          </button>
        </div>
        </div>

            {/* Toggle between Active and Completed */}
      <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveSection('active')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeSection === 'active'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
          Active ({activeAssessments.length})
              </button>
              <button
                onClick={() => setActiveSection('completed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeSection === 'completed'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
          Completed ({completedAssessments.length})
              </button>
            </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assessments by title, description, or job..."
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
            <option value="archived">Archived</option>
          </select>
            </div>
            </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <p className="font-semibold">Error loading assessments</p>
          <p className="text-sm mt-1">{error.message}</p>
            </div>
      )}

      {/* Assessment List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading assessments...</p>
             </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-16">
            <FiFileText className="w-20 h-20 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No assessments found' : 'No assessments yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first assessment'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
               <button
                onClick={handleNewAssessment}
                disabled={createDraftMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                {createDraftMutation.isPending ? 'Creating...' : 'Create Your First Assessment'}
               </button>
                           )}
                         </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment, index) => (
                   <motion.div
                key={assessment.id}
                className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 overflow-hidden hover:border-orange-500/30 hover:bg-white/10 transition-all"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                     >
                       <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <FiFileText className="w-6 h-6 text-orange-400" />
                         </div>

                  {/* Content */}
                         <div className="flex-1 min-w-0">
                           <div className="flex items-start justify-between mb-3">
                             <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 
                            onClick={() => router.push(`/admin/assessment-view?id=${assessment.id}`)}
                            className="text-xl font-bold text-white cursor-pointer hover:text-orange-400 transition-colors truncate"
                          >
                            {assessment.title || 'Untitled Assessment'}
                          </h3>
                          {/* Show job title if linked to job, otherwise show role name */}
                          {(assessment.jobTitle || assessment.jobTitleName) && (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
                              {assessment.jobTitle ? `Job: ${assessment.jobTitle}` : `Role: ${assessment.jobTitleName}`}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(assessment.status)}`}>
                            {(assessment.status || 'draft').charAt(0).toUpperCase() + (assessment.status || 'draft').slice(1)}
                               </span>
                             </div>
                        {assessment.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">{assessment.description}</p>
                 )}
               </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        {/* Only show Copy Link for published assessments */}
                        {assessment.status !== 'draft' && (
                          <button
                            onClick={() => handleCopyLink(assessment.id)}
                            className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 ${
                              copiedLink === assessment.id
                                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white'
                            }`}
                            title="Copy assessment link"
                          >
                            <FiCopy className="w-4 h-4" />
                            {copiedLink === assessment.id ? 'Copied!' : 'Link'}
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/admin/assessment-edit?id=${assessment.id}`)}
                          className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 text-blue-400"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        {/* Only show View Results for published assessments */}
                        {assessment.status !== 'draft' && (
                          <button
                            onClick={() => router.push(`/admin/assessment-view?id=${assessment.id}`)}
                            className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 text-purple-400"
                            title="View Results"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(assessment.id)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 text-red-400"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                        <FiFileText className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">Questions:</span>
                        <span className="font-semibold text-white">{assessment.questions || 0}</span>
                        </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold text-white">{assessment.duration || 60} min</span>
                      </div>
                      {assessment.questionTypes && assessment.questionTypes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Types:</span>
                          <div className="flex gap-1">
                            {assessment.questionTypes.map((qt, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-300">
                                {qt.type} ({qt.count})
                    </span>
                      ))}
                    </div>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </motion.div>
            ))}
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AssessmentList;
