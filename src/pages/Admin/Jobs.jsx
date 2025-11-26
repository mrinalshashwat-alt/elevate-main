'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getJobs, createJob, updateJob, deleteJob } from '../../api/admin';
import { jobsStorage, assessmentsStorage } from '../../lib/localStorage';
import AdminLayout from '../../components/AdminLayout';
import JobTitleSearch from '../../components/JobTitleSearch';
import CompetencySelector from '../../components/CompetencySelector';

const Jobs = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    job_title: '',
    description: '',
    responsibilities: [],
    requirements: [],
    min_experience_years: '',
    max_experience_years: '',
    job_type: 'full_time',
    location_type: 'remote',
    location_city: '',
    location_state: '',
    location_country: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    competency_ids: [],
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: async () => {
      // TODO: Replace with actual API call when backend is ready
      try {
        const apiData = await getJobs();
        // Merge with localStorage data
        const localJobs = jobsStorage.getAll();
        const apiJobIds = new Set(apiData.data.map(j => j.id));
        const uniqueLocalJobs = localJobs.filter(j => !apiJobIds.has(j.id));
        
        return {
          ...apiData,
          data: [...apiData.data, ...uniqueLocalJobs],
          total: apiData.total + uniqueLocalJobs.length,
        };
      } catch (error) {
        // If API fails, use localStorage only
        console.log('API call failed, using localStorage:', error);
        const localJobs = jobsStorage.getAll();
        return {
          data: localJobs,
          total: localJobs.length,
          page: 1,
          pageSize: 10,
        };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (jobData) => {
      // TODO: Replace with actual API call when backend is ready
      try {
        const result = await createJob(jobData);
        // Also save to localStorage
        jobsStorage.save({
          ...jobData,
          id: result.id || `job_${Date.now()}`,
          postedAt: new Date().toISOString(),
        });
        return result;
      } catch (error) {
        // If API fails, use localStorage
        console.log('API call failed, using localStorage:', error);
        const savedJob = jobsStorage.save({
          ...jobData,
          id: `job_${Date.now()}`,
          postedAt: new Date().toISOString(),
        });
        return savedJob;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // TODO: Replace with actual API call when backend is ready
      try {
        const result = await updateJob(id, data);
        // Also update localStorage
        jobsStorage.save({ ...data, id });
        return result;
      } catch (error) {
        // If API fails, use localStorage
        console.log('API call failed, using localStorage:', error);
        jobsStorage.save({ ...data, id });
        return { ...data, id };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      setShowModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId) => {
      // TODO: Replace with actual API call when backend is ready
      try {
        await deleteJob(jobId);
      } catch (error) {
        console.log('API call failed, using localStorage:', error);
      }
      // Always delete from localStorage
      jobsStorage.delete(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      job_title: '',
      description: '',
      responsibilities: [],
      requirements: [],
      min_experience_years: '',
      max_experience_years: '',
      job_type: 'full_time',
      location_type: 'remote',
      location_city: '',
      location_state: '',
      location_country: '',
      salary_min: '',
      salary_max: '',
      salary_currency: 'USD',
      competency_ids: [],
    });
    setSelectedJobTitle(null);
    setSelectedCompetencies([]);
    setEditingJob(null);
    setHasUnsavedChanges(false);
  };

  // Track form changes
  useEffect(() => {
    if (showModal) {
      const hasChanges = formData.title || formData.description || formData.min_experience_years ||
                        formData.max_experience_years || formData.location_city || formData.salary_min;
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, showModal]);

  // Handle window close/tab switch
  useEffect(() => {
    if (!showModal || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e) => {
      // Auto-save as draft when user navigates away
      if (hasUnsavedChanges) {
        const draftData = {
          ...formData,
          status: 'draft',
          id: editingJob?.id || `draft_${Date.now()}`,
          postedAt: new Date().toISOString(),
        };
        jobsStorage.save(draftData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showModal, hasUnsavedChanges, formData, editingJob]);

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      setPendingClose(true);
      setShowDiscardModal(true);
    } else {
      setShowModal(false);
      resetForm();
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      status: 'draft',
      id: editingJob?.id || `draft_${Date.now()}`,
      postedAt: new Date().toISOString(),
    };
    jobsStorage.save(draftData);
    queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
    setShowModal(false);
    setShowDiscardModal(false);
    resetForm();
  };

  const handleDiscard = () => {
    setShowModal(false);
    setShowDiscardModal(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      job_title: job.job_title || '',
      description: job.description || '',
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      min_experience_years: job.min_experience_years || '',
      max_experience_years: job.max_experience_years || '',
      job_type: job.job_type || 'full_time',
      location_type: job.location_type || 'remote',
      location_city: job.location_city || '',
      location_state: job.location_state || '',
      location_country: job.location_country || '',
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      salary_currency: job.salary_currency || 'USD',
      competency_ids: job.competency_ids || [],
    });
    setShowModal(true);
  };

  const handleDelete = (jobId) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteMutation.mutate(jobId);
    }
  };

  const handleViewAssessments = (job) => {
    setSelectedJob(job);
    setShowAssessmentModal(true);
  };

  const getJobAssessments = (jobId) => {
    // Get assessments from both API and localStorage
    const localAssessments = assessmentsStorage.getByJobId(jobId);
    return localAssessments;
  };

  const generateJobDescription = async () => {
    if (!formData.title || !formData.min_experience_years) {
      alert('Please enter Job Title and Minimum Experience first to generate a description.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Mock AI generation - in production, this would call your AI API
      const experienceRange = formData.max_experience_years
        ? `${formData.min_experience_years}-${formData.max_experience_years}`
        : `${formData.min_experience_years}+`;
      const prompt = `Create a comprehensive job description for a ${formData.title} position requiring ${experienceRange} years of experience. Include responsibilities, requirements, and qualifications.`;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock generated description
      const generatedDescription = `We are seeking an experienced ${formData.title} with ${experienceRange} years of experience to join our team.

**Key Responsibilities:**
- Lead and manage ${formData.title.toLowerCase()} initiatives
- Collaborate with cross-functional teams
- Develop and implement strategic solutions
- Ensure quality deliverables within deadlines

**Required Qualifications:**
- ${experienceRange} years of relevant experience
- Strong problem-solving and analytical skills
- Excellent communication and collaboration abilities
- Proven track record of success in similar roles

**Preferred Skills:**
- Industry certifications
- Advanced technical knowledge
- Leadership experience

Join us and be part of an innovative team driving excellence in our industry.`;

      setFormData({ ...formData, description: generatedDescription });
    } catch (error) {
      console.error('Error generating job description:', error);
      alert('Failed to generate job description. Please try again or paste your existing JD.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <AdminLayout title="Jobs">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Manage Jobs</h1>
          <p className="text-gray-400">Create and manage job postings with AI-powered descriptions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Post Job</span>
        </button>
      </div>

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
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsData?.data.map((job) => (
              <div key={job.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                    <p className="text-gray-400">{job.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                    job.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {job.status || 'draft'}
                  </span>
                </div>
                
                {job.description && (
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{job.description}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  {job.yearsOfExperience && (
                    <div className="flex items-center text-sm text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {job.yearsOfExperience} years experience
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.type}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.salary}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewAssessments(job)}
                    className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all text-sm font-medium hover:scale-105"
                  >
                    View Assessments ({getJobAssessments(job.id).length})
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all hover:scale-105"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Job Title Search */}
              <div>
                <JobTitleSearch
                  onSelect={(jobTitle) => {
                    setSelectedJobTitle(jobTitle);
                    setFormData(prev => ({
                      ...prev,
                      job_title: jobTitle.id,
                      title: prev.title || jobTitle.name
                    }));
                  }}
                  value={selectedJobTitle?.name || ''}
                />
              </div>

              {/* Custom Job Posting Title */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Job Posting Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                  placeholder="e.g., Senior Software Engineer - Backend Team"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">This can be more specific than the job title above</p>
              </div>

              {/* Competencies Selector */}
              <div>
                <CompetencySelector
                  jobTitleId={selectedJobTitle?.id}
                  selectedCompetencies={selectedCompetencies}
                  onCompetenciesChange={(comps) => {
                    setSelectedCompetencies(comps);
                    setFormData(prev => ({
                      ...prev,
                      competency_ids: comps.map(c => c.id)
                    }));
                  }}
                />
              </div>

              {/* Experience Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Min Experience (years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.min_experience_years}
                    onChange={(e) => setFormData({ ...formData, min_experience_years: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Max Experience (years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.max_experience_years}
                    onChange={(e) => setFormData({ ...formData, max_experience_years: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">Job Description *</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={generateJobDescription}
                      disabled={isGeneratingAI || !formData.title || !formData.min_experience_years}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isGeneratingAI ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generate with AI
                        </>
                      )}
                    </button>
                    {formData.description && (
                      <button
                        type="button"
                        onClick={() => {
                          // Improvement button - could enhance description with AI
                          const improvedPrompt = `Improve and enhance the following job description: ${formData.description}`;
                          generateJobDescription();
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all text-sm"
                        title="Improve description"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Improve
                      </button>
                    )}
                    {formData.description && (
                      <button
                        type="button"
                        onClick={() => {
                          // Export to PDF functionality
                          const printWindow = window.open('', '_blank');
                          const location = [formData.location_city, formData.location_state, formData.location_country]
                            .filter(Boolean).join(', ') || formData.location_type || 'N/A';
                          const experience = formData.max_experience_years
                            ? `${formData.min_experience_years}-${formData.max_experience_years} years`
                            : formData.min_experience_years ? `${formData.min_experience_years}+ years` : 'N/A';
                          const salary = formData.salary_min && formData.salary_max
                            ? `${formData.salary_currency} ${formData.salary_min} - ${formData.salary_max}`
                            : 'N/A';
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>${formData.title} - Job Description</title>
                                <style>
                                  body { font-family: Arial, sans-serif; padding: 40px; }
                                  h1 { color: #333; }
                                  .meta { color: #666; margin-bottom: 20px; }
                                  .description { line-height: 1.6; }
                                </style>
                              </head>
                              <body>
                                <h1>${formData.title}</h1>
                                <div class="meta">
                                  <p><strong>Location:</strong> ${location}</p>
                                  <p><strong>Experience:</strong> ${experience}</p>
                                  <p><strong>Type:</strong> ${formData.job_type?.replace('_', ' ') || 'N/A'}</p>
                                  <p><strong>Salary:</strong> ${salary}</p>
                                </div>
                                <div class="description">
                                  ${formData.description.replace(/\n/g, '<br>')}
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          setTimeout(() => {
                            printWindow.print();
                          }, 250);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-all text-sm"
                        title="Export to PDF"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Export PDF
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 min-h-[200px] resize-y text-white placeholder-gray-500"
                  placeholder="Paste your existing job description here or click 'Generate with AI' to create one automatically..."
                  required
                />
                <p className="mt-1 text-xs text-gray-400">You can paste your existing JD or use AI to generate one</p>
              </div>

              <div className="border-t border-white/10 pt-4 mt-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Job Type & Location</h3>
              </div>

              {/* Job Type & Location Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Job Type</label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Location Type</label>
                  <select
                    value={formData.location_type}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">City</label>
                  <input
                    type="text"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                    placeholder="San Francisco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">State</label>
                  <input
                    type="text"
                    value={formData.location_state}
                    onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Country</label>
                  <input
                    type="text"
                    value={formData.location_country}
                    onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                    placeholder="USA"
                  />
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Salary Range</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                      placeholder="Min (120000)"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                      placeholder="Max (180000)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.salary_currency}
                      onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                      placeholder="USD"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all text-sm"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showAssessmentModal && selectedJob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Assessments for {selectedJob.title}</h2>
                <p className="text-gray-400 mt-1">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssessmentModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {getJobAssessments(selectedJob.id).length > 0 ? (
                getJobAssessments(selectedJob.id).map((assessment) => (
                  <div
                    key={assessment.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{assessment.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{assessment.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-gray-400">
                            <span className="font-semibold">Duration:</span> {assessment.duration} min
                          </span>
                          <span className="text-gray-400">
                            <span className="font-semibold">Questions:</span> {assessment.questions || assessment.questionData?.length || 0}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            assessment.status === 'published' ? 'bg-green-500/20 text-green-400' :
                            assessment.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {assessment.status}
                          </span>
                        </div>
                        {assessment.questionTypes && assessment.questionTypes.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {assessment.questionTypes.map((qt, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                              >
                                {qt.type}: {qt.count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => router.push(`/admin/create-assessment?jobId=${selectedJob.id}&assessmentId=${assessment.id}`)}
                        className="ml-4 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-all text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg mb-2">No assessments found for this job</p>
                  <p className="text-sm">Create an assessment to get started</p>
                  <button
                    onClick={() => {
                      setShowAssessmentModal(false);
                      router.push(`/admin/create-assessment?jobId=${selectedJob.id}`);
                    }}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Create Assessment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1100] p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-white">Unsaved Changes</h3>
            <p className="text-gray-400 mb-6">
              You have unsaved changes. Would you like to save as draft or discard?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDiscard}
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all text-red-400 font-semibold"
              >
                Discard
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Jobs;
