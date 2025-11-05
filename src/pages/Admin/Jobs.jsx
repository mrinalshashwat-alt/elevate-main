'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getJobs, createJob, updateJob, deleteJob } from '../../api/admin';

const Jobs = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    yearsOfExperience: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    status: 'active',
  });

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: () => getJobs(),
  });

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      setShowModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', yearsOfExperience: '', company: '', location: '', type: 'full-time', salary: '', status: 'active' });
    setEditingJob(null);
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
      description: job.description || '',
      yearsOfExperience: job.yearsOfExperience || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'full-time',
      salary: job.salary || '',
      status: job.status || 'active',
    });
    setShowModal(true);
  };

  const handleDelete = (jobId) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteMutation.mutate(jobId);
    }
  };

  const generateJobDescription = async () => {
    if (!formData.title || !formData.yearsOfExperience) {
      alert('Please enter Job Title and Years of Experience first to generate a description.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Mock AI generation - in production, this would call your AI API
      const prompt = `Create a comprehensive job description for a ${formData.title} position requiring ${formData.yearsOfExperience} years of experience. Include responsibilities, requirements, and qualifications.`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated description
      const generatedDescription = `We are seeking an experienced ${formData.title} with ${formData.yearsOfExperience}+ years of experience to join our team.

**Key Responsibilities:**
- Lead and manage ${formData.title.toLowerCase()} initiatives
- Collaborate with cross-functional teams
- Develop and implement strategic solutions
- Ensure quality deliverables within deadlines

**Required Qualifications:**
- ${formData.yearsOfExperience}+ years of relevant experience
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push('/admin/dashboard')} className="flex items-center space-x-2 hover:text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold">Manage Jobs</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Post Job
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsData?.data.map((job) => (
              <div key={job.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                    <p className="text-gray-400">{job.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {job.status}
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
                    onClick={() => handleEdit(job)}
                    className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-6">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Required Fields - Priority */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                  placeholder="e.g., 3"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">Job Description *</label>
                  <button
                    type="button"
                    onClick={generateJobDescription}
                    disabled={isGeneratingAI || !formData.title || !formData.yearsOfExperience}
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
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Additional Information</h3>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                  placeholder="Enter job location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Job Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Salary</label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                  placeholder="e.g., $100k - $120k"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
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
    </div>
  );
};

export default Jobs;
