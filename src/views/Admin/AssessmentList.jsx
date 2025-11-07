'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssessments, deleteAssessment, getJobs, createJob } from '../../api/admin';

// Custom glass popover select component matching AIMockInterview style
const GlassSelect = ({ value, onChange, options, placeholder = 'Select', className = '', required = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-300 flex items-center justify-between"
      >
        <span className={`${selected ? 'text-gray-200' : 'text-gray-500'}`}>{selected ? selected.label : placeholder}</span>
        <svg className={`w-4 h-4 text-orange-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden border border-orange-500/30 backdrop-blur-md" style={{ background: 'linear-gradient(180deg, rgba(33,20,14,0.9) 0%, rgba(191,54,12,0.6) 100%)', boxShadow: '0 12px 32px rgba(255,87,34,0.25)' }}>
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value || 'empty'}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-white/10 text-white' : 'text-gray-200 hover:bg-white/10'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AssessmentList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeMainTab, setActiveMainTab] = useState('jobs'); // 'jobs' or 'assessments'
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [activeSection, setActiveSection] = useState('active'); // 'active' or 'completed'

  // Read URL parameters to set initial state
  useEffect(() => {
    const section = searchParams.get('section');
    const tab = searchParams.get('tab');
    if (section === 'completed') {
      setActiveSection('completed');
      setActiveMainTab('assessments');
    } else if (tab === 'candidates') {
      // Navigate to candidates page if that's what's requested
      router.push('/admin/candidates');
    }
  }, [searchParams, router]);
  const [assessmentType, setAssessmentType] = useState('coding');
  const [numQuestions, setNumQuestions] = useState(2);
  const [totalTime, setTotalTime] = useState(1);
  const [makePublic, setMakePublic] = useState(true);
  
  // Job creation states
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    yearsOfExperience: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
  });
  const [selectedAssessmentFilter, setSelectedAssessmentFilter] = useState('');
  const [createdJobId, setCreatedJobId] = useState(null); // Track newly created job for "Go to Assessment" button

  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);

  // Manual states
  const [manualQuestions, setManualQuestions] = useState([]);
  const [currentQuestionType, setCurrentQuestionType] = useState('coding');
  const [newQuestion, setNewQuestion] = useState({
    type: 'coding',
    question: '',
    testCases: '',
    expectedOutput: '',
    options: [],
    correctAnswer: ''
  });

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['adminAssessments'],
    queryFn: () => getAssessments(),
    retry: false, // Don't retry failed requests since we use mock data
    refetchOnWindowFocus: false, // Don't refetch on window focus for mock data
  });

  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: () => getJobs(),
    retry: false, // Don't retry failed requests since we use mock data
    refetchOnWindowFocus: false, // Don't refetch on window focus for mock data
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      setCreatedJobId(data.id);
      // Keep modal open to show "Go to Assessment" button
    },
  });

  const handleDelete = (assessmentId) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      deleteMutation.mutate(assessmentId);
    }
  };

  const handleCreateJob = () => {
    createJobMutation.mutate({
      title: newJob.title,
      description: newJob.description,
      yearsOfExperience: newJob.yearsOfExperience,
      company: newJob.company || 'Company',
      location: newJob.location || 'Location',
      type: newJob.type || 'full-time',
      salary: newJob.salary || '',
      status: 'active',
      postedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleGoToAssessment = () => {
    setShowJobModal(false);
    setCreatedJobId(null);
    setNewJob({
      title: '',
      description: '',
      yearsOfExperience: '',
      company: '',
      location: '',
      type: 'full-time',
      salary: '',
    });
    router.push(`/admin/create-assessment?jobId=${createdJobId}`);
  };

  const addManualQuestion = () => {
    setManualQuestions([...manualQuestions, { ...newQuestion }]);
    setNewQuestion({
      type: 'coding',
      question: '',
      testCases: '',
      expectedOutput: '',
      options: [],
      correctAnswer: ''
    });
  };

  const activeAssessments = [
    {
      id: 1,
      title: 'Java Developer Entry Level',
      jobTitle: 'Senior Java Developer',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      description: 'We are seeking a skilled Java developer to join our entry-level cohort.',
      details: 'Automated technical screening with coding prompts and behavioral Q&A.',
      completed: 12,
      invitations: 45
    },
    {
      id: 2,
      title: 'Data Analyst - SQL & BI',
      jobTitle: 'Data Analyst',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: 'Evaluate SQL fluency, dashboard literacy, and stakeholder communication.',
      details: 'Adaptive question routing using knowledge graph alignment.',
      completed: 7,
      invitations: 28
    },
    {
      id: 3,
      title: 'Frontend Engineer - React',
      jobTitle: 'Frontend Developer',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Assess React patterns, accessibility, and UI problem solving.',
      details: 'Includes live UI critique and code reading tasks.',
      completed: 19,
      invitations: 60
    },
    {
      id: 4,
      title: 'DevOps Engineer - Entry',
      jobTitle: 'DevOps Engineer',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: 'Scenario-based on-call drills and IaC comprehension.',
      details: 'Agent-led incident walkthrough with scoring rubric.',
      completed: 4,
      invitations: 22
    },
    {
      id: 5,
      title: 'Associate, ML Data Operations',
      jobTitle: 'ML Data Associate',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: 'Evaluate labeling quality, ambiguity handling, and escalation judgment.',
      details: 'Rubric-aligned scoring with explanation traces.',
      completed: 9,
      invitations: 34
    }
  ];

  const completedAssessments = [
    {
      id: 1,
      title: 'Backend Coding Challenge',
      role: 'Software Engineering',
      candidates: 54,
      dateCompleted: 'Sep 28, 2025'
    },
    {
      id: 2,
      title: 'Product Sense Interview',
      role: 'Product / PM',
      candidates: 27,
      dateCompleted: 'Sep 22, 2025'
    },
    {
      id: 3,
      title: 'Data Analyst SQL Test',
      role: 'Analytics',
      candidates: 41,
      dateCompleted: 'Sep 20, 2025'
    },
    {
      id: 4,
      title: 'UI/UX Portfolio Review',
      role: 'Design',
      candidates: 33,
      dateCompleted: 'Sep 18, 2025'
    },
    {
      id: 5,
      title: 'Security Fundamentals',
      role: 'IT / Security',
      candidates: 19,
      dateCompleted: 'Sep 12, 2025'
    }
  ];

  const filteredCompletedAssessments = selectedAssessmentFilter
    ? completedAssessments.filter(a => a.title === selectedAssessmentFilter)
    : completedAssessments;

  const totalAssessments = 24;
  const totalCandidates = 312;
  const avgScore = 78;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <button 
            onClick={() => router.push('/admin/dashboard')} 
            className="flex items-center space-x-2 hover:text-orange-400 transition-all group px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AI Assessment</h1>
          </div>
          <div className="w-40"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Toggle Section */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveMainTab('jobs')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeMainTab === 'jobs'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            Jobs ({jobsData?.data?.length || 0})
          </button>
          <button
            onClick={() => setActiveMainTab('assessments')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeMainTab === 'assessments'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            Assessments ({activeAssessments.length})
          </button>
        </div>

        {/* Assessments Tab Content */}
        {activeMainTab === 'assessments' && (
          <>
            {/* Toggle between Active and Completed */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveSection('active')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeSection === 'active'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                Active Assessments ({activeAssessments.length})
              </button>
              <button
                onClick={() => setActiveSection('completed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeSection === 'completed'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                Completed Assessments ({completedAssessments.length})
              </button>
            </div>

        {/* Active Assessments Section */}
        {activeSection === 'active' && (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2 text-white">Active Assessments ({activeAssessments.length})</h2>
              <p className="text-gray-400">View all active AI-driven assessments running in your organization.</p>
            </div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => router.push('/admin/create-assessment')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Assessment
              </button>
            </div>
            <div className="space-y-4">
              {activeAssessments.map((assessment, index) => (
                <motion.div
                  key={assessment.id}
                  className="group relative bg-black/90 border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-orange-500/50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start gap-6">
                    <div className="text-orange-400">{assessment.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white">{assessment.title}</h3>
                            {assessment.jobTitle && (
                              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-semibold">
                                {assessment.jobTitle}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 mb-2">{assessment.description}</p>
                          <p className="text-sm text-gray-500">{assessment.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Completed</span>
                          <span className="font-bold text-white">{assessment.completed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Invitations</span>
                          <span className="font-bold text-white">{assessment.invitations}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

                  {/* Completed Assessments Section */}
        {activeSection === 'completed' && (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2 text-white">Completed Assessments</h2>
              <p className="text-gray-400">View all completed assessments and their reports.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <motion.div
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-sm text-gray-400 mb-2">Total Assessments</h3>
                <p className="text-4xl font-bold text-white">{totalAssessments}</p>
              </motion.div>
              <motion.div
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-sm text-gray-400 mb-2">Candidates</h3>
                <p className="text-4xl font-bold text-white">{totalCandidates}</p>
              </motion.div>
            </div>

            {/* Filter Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-400 mb-3">Filter by Assessment</label>
              <div className="w-full max-w-md">
                <GlassSelect
                  value={selectedAssessmentFilter}
                  onChange={(value) => setSelectedAssessmentFilter(value)}
                  placeholder="All Assessments"
                  options={[
                    { value: '', label: 'All Assessments' },
                    ...completedAssessments.map((assessment) => ({
                      value: assessment.title,
                      label: assessment.title
                    }))
                  ]}
                />
              </div>
            </div>

            {/* Completed Assessments Table */}
            <div className="bg-black/90 border border-white/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          Assessments
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Role / Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Total Candidates</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date Completed</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompletedAssessments.map((assessment, index) => (
                      <motion.tr
                        key={assessment.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">{assessment.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400">{assessment.role}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold">{assessment.candidates}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400">{assessment.dateCompleted}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push('/admin/candidates')}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                          >
                            View Results
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
          </>
        )}

        {/* Jobs Section */}
         {activeMainTab === 'jobs' && (
           <>
             <div className="mb-8">
               <h2 className="text-4xl font-bold mb-2 text-white">Jobs</h2>
               <p className="text-gray-400">Create jobs for assessment creation.</p>
             </div>
             <div className="flex justify-end mb-6">
               <button
                 onClick={() => {
                   setShowJobModal(true);
                   setCreatedJobId(null);
                   setNewJob({
                     title: '',
                     description: '',
                     yearsOfExperience: '',
                     company: '',
                     location: '',
                     type: 'full-time',
                     salary: '',
                   });
                 }}
                 className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95 flex items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
                 Create New Job
               </button>
             </div>
             <div className="space-y-4">
               {jobsLoading ? (
                 <motion.div
                   className="bg-black/90 border border-white/10 rounded-3xl p-16 text-center"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                 >
                   <div className="flex items-center justify-center">
                     <svg className="w-8 h-8 animate-spin text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     <span className="ml-3 text-gray-400">Loading jobs...</span>
                   </div>
                 </motion.div>
               ) : (jobsData?.data && Array.isArray(jobsData.data) && jobsData.data.length > 0) ? (
                 jobsData.data.map((job, index) => (
                   <motion.div
                     key={job.id || index}
                     className="group relative bg-black/90 border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-orange-500/50 transition-all"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3, delay: index * 0.1 }}
                     whileHover={{ y: -4 }}
                   >
                     <div className="flex items-start gap-6">
                       <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                         <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                         </svg>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex-1 min-w-0">
                             <h3 className="text-2xl font-bold text-white mb-3">{job.title || 'Untitled Job'}</h3>
                             {job.competencies && Array.isArray(job.competencies) && job.competencies.length > 0 ? (
                               <div>
                                 <p className="text-sm text-gray-400 mb-2">Competencies:</p>
                                 <div className="flex flex-wrap gap-2">
                                   {job.competencies.map((comp, idx) => (
                                     <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-sm font-semibold">
                                       {comp}
                                     </span>
                                   ))}
                                 </div>
                               </div>
                             ) : (
                               <p className="text-gray-500 text-sm">No competencies added yet</p>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 ))
               ) : (
                 <motion.div
                   className="bg-black/90 border border-white/10 rounded-3xl p-16 text-center"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                 >
                   <svg className="w-24 h-24 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                   </svg>
                   <h3 className="text-2xl font-bold mb-3 text-white">No jobs created yet</h3>
                   <p className="text-gray-400 mb-6">Create your first job to get started</p>
                   <button
                     onClick={() => {
                       setShowJobModal(true);
                       setNewJob({
                         title: '',
                         description: '',
                         yearsOfExperience: '',
                         company: '',
                         location: '',
                         type: 'full-time',
                         salary: '',
                       });
                     }}
                     className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                   >
                     Create Job
                   </button>
                 </motion.div>
               )}
             </div>
           </>
         )}
      </main>

      {/* New Assessment Modal */}
      <AnimatePresence>
        {showNewAssessment && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewAssessment(false)}
          >
            <motion.div
              className="group relative bg-black/95 border border-orange-500/50 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
              }}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative z-20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">New Assessment</h2>
                  <button
                    onClick={() => setShowNewAssessment(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Job Details */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Job</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        defaultValue="Batch 3 Python Developer [Entry Level]"
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Assessment Type Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Select Assessment Type</label>
                    <GlassSelect
                      value={assessmentType}
                      onChange={(value) => setAssessmentType(value)}
                      placeholder="Select Assessment Type"
                      options={[
                        { value: 'coding', label: 'Coding' },
                        { value: 'video', label: 'Video' },
                        { value: 'mcq', label: 'MCQ' }
                      ]}
                    />
                  </div>

                  {/* Assessment Metrics */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-3">Number of Questions</label>
                      <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-3">Total Time</label>
                      <input
                        type="number"
                        value={totalTime}
                        onChange={(e) => setTotalTime(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-4">Questions</label>
                    <div className="grid grid-cols-3 gap-6">
                      {/* CSV Upload */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="font-semibold text-white mb-4">Drop CSV file</h3>
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-orange-500/50 transition-colors cursor-pointer">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-gray-400 mb-2">Drag &amp; drop CSV here</p>
                          <p className="text-xs text-gray-500">Upload a .csv with columns: question, choices, answer</p>
                        </div>
                      </div>

                      {/* AI Generate */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="font-semibold text-white mb-4">Generate Using AI</h3>
                        <button
                          onClick={() => setShowAIModal(true)}
                          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Generate Now
                        </button>
                      </div>

                      {/* Manual Write */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="font-semibold text-white mb-4">Write Manually</h3>
                        <button
                          onClick={() => setShowManualModal(true)}
                          className="w-full py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                        >
                          Start Writing
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={makePublic}
                        onChange={(e) => setMakePublic(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-14 h-8 rounded-full transition-all relative ${makePublic ? 'bg-orange-500' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all ${makePublic ? 'translate-x-6' : ''}`}></div>
                      </div>
                      <span className="text-white font-semibold">Make it Public</span>
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowNewAssessment(false)}
                        className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          // Handle save
                          setShowNewAssessment(false);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAIModal(false)}
          >
            <motion.div
              className="relative bg-black/95 border border-orange-500/50 rounded-3xl p-8 max-w-2xl w-full"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">AI Question Generation</h3>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-3">Prompt</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Write your prompt to generate questions..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none h-32"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Difficulty</label>
                    <GlassSelect
                      value={aiDifficulty}
                      onChange={(value) => setAiDifficulty(value)}
                      placeholder="Select difficulty"
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'hard', label: 'Hard' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Number of Questions</label>
                    <input
                      type="number"
                      value={aiQuestionCount}
                      onChange={(e) => setAiQuestionCount(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle AI generation
                      console.log('Generating AI questions...', { aiPrompt, aiDifficulty, aiQuestionCount });
                      setShowAIModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                  >
                    Generate Questions
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Question Modal */}
      <AnimatePresence>
        {showManualModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowManualModal(false)}
          >
            <motion.div
              className="relative bg-black/95 border border-orange-500/50 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Add Questions Manually</h3>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Question Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-3">Question Type</label>
                  <GlassSelect
                    value={newQuestion.type}
                    onChange={(value) => setNewQuestion({ ...newQuestion, type: value })}
                    placeholder="Select question type"
                    options={[
                      { value: 'coding', label: 'Coding' },
                      { value: 'video', label: 'Video' },
                      { value: 'mcq', label: 'MCQ' }
                    ]}
                  />
                </div>

                {/* Question Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-3">Question</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Enter your question..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none h-32"
                  />
                </div>

                {/* Conditional Fields based on type */}
                {newQuestion.type === 'coding' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-3">Test Cases</label>
                      <textarea
                        value={newQuestion.testCases}
                        onChange={(e) => setNewQuestion({ ...newQuestion, testCases: e.target.value })}
                        placeholder="Enter test cases..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none h-24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-3">Expected Output</label>
                      <textarea
                        value={newQuestion.expectedOutput}
                        onChange={(e) => setNewQuestion({ ...newQuestion, expectedOutput: e.target.value })}
                        placeholder="Enter expected output..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none h-24"
                      />
                    </div>
                  </>
                )}

                {newQuestion.type === 'mcq' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-3">Options</label>
                      <div className="space-y-3">
                        {['A', 'B', 'C', 'D'].map((option, idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Option ${option}`}
                            value={newQuestion.options[idx] || ''}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[idx] = e.target.value;
                              setNewQuestion({ ...newQuestion, options: newOptions });
                            }}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                          />
            ))}
          </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-3">Correct Answer</label>
                      <input
                        type="text"
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                        placeholder="Enter correct answer (e.g., A, B, C, D)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={addManualQuestion}
                  className="w-full py-3 bg-orange-500/20 border border-orange-500/50 rounded-xl font-semibold text-orange-400 hover:bg-orange-500/30 transition-all"
                >
                  Add Question
                </button>

                {/* List of Added Questions */}
                {manualQuestions.length > 0 && (
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-lg font-bold text-white mb-4">Added Questions ({manualQuestions.length})</h4>
                    <div className="space-y-3">
                      {manualQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-400">Q{idx + 1}: {q.type.toUpperCase()}</p>
                              <p className="text-white mt-1">{q.question.substring(0, 60)}...</p>
                            </div>
                            <button
                              onClick={() => {
                                const updated = manualQuestions.filter((_, i) => i !== idx);
                                setManualQuestions(updated);
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setManualQuestions([]);
                      setShowManualModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
            <button
                    onClick={() => {
                      console.log('Saving questions...', manualQuestions);
                      setShowManualModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                  >
                    Save Questions
            </button>
          </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Job Modal */}
      <AnimatePresence>
        {showJobModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJobModal(false)}
          >
            <motion.div
              className="group relative bg-black/95 border border-orange-500/50 rounded-3xl p-8 max-w-2xl w-full"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative z-20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Create New Job</h2>
                  <button
                    onClick={() => {
                      setShowJobModal(false);
                      setCreatedJobId(null);
                      setNewJob({
                        title: '',
                        description: '',
                        yearsOfExperience: '',
                        company: '',
                        location: '',
                        type: 'full-time',
                        salary: '',
                      });
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Job Title *</label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Job Description *</label>
                    <textarea
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 min-h-[120px] resize-y"
                      placeholder="Enter detailed job description..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Years of Experience *</label>
                    <input
                      type="number"
                      min="0"
                      value={newJob.yearsOfExperience}
                      onChange={(e) => setNewJob({ ...newJob, yearsOfExperience: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      placeholder="e.g., 3"
                      required
                    />
                  </div>
                  {createdJobId ? (
                    <div className="space-y-4">
                      <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                        <p className="text-green-400 font-semibold">Job created successfully!</p>
                      </div>
                      <button
                        onClick={handleGoToAssessment}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Go to Assessment
                      </button>
                      <button
                        onClick={() => {
                          setShowJobModal(false);
                          setCreatedJobId(null);
                          setNewJob({
                            title: '',
                            description: '',
                            yearsOfExperience: '',
                            company: '',
                            location: '',
                            type: 'full-time',
                            salary: '',
                          });
                        }}
                        className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowJobModal(false)}
                        className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateJob}
                        disabled={createJobMutation.isPending || !newJob.title.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default AssessmentList;
