'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { getAssessments, deleteAssessment, getJobs, createJob, updateJob, deleteJob, createAssessment, createDraftJob } from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';
import JobTitleSearch from '../../components/JobTitleSearch';
import CompetencySelector from '../../components/CompetencySelector';

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
  const [activeJobsTab, setActiveJobsTab] = useState('active'); // 'active' or 'past'
  const [selectedJobForView, setSelectedJobForView] = useState(null);
  const [showJobAssessmentModal, setShowJobAssessmentModal] = useState(false);

  // Read URL parameters to set initial state
  useEffect(() => {
    const section = searchParams.get('section');
    const tab = searchParams.get('tab');
    if (section === 'completed') {
      setActiveSection('completed');
      setActiveMainTab('assessments');
    } else if (tab === 'jobs') {
      setActiveMainTab('jobs');
    } else if (tab === 'assessments') {
      setActiveMainTab('assessments');
    } else if (tab === 'candidates') {
      // Navigate to candidates page if that's what's requested
      router.push('/admin/candidates');
    }
    // If no tab is specified, default to assessments tab
    else if (!tab) {
      setActiveMainTab('assessments');
    }
  }, [searchParams, router]);
  const [assessmentType, setAssessmentType] = useState('coding');
  const [numQuestions, setNumQuestions] = useState(2);
  const [totalTime, setTotalTime] = useState(1);
  const [makePublic, setMakePublic] = useState(true);
  const [assessmentInstructions, setAssessmentInstructions] = useState('');
  
  // Job creation states
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [newJob, setNewJob] = useState({
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
  const [selectedAssessmentFilter, setSelectedAssessmentFilter] = useState('');
  const [createdJobId, setCreatedJobId] = useState(null); // Track newly created job for "Go to Assessment" button
  const [createdAssessmentId, setCreatedAssessmentId] = useState(null); // Track newly created assessment for link generation
  const [selectedJobId, setSelectedJobId] = useState(''); // Track selected job in assessment modal

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
    queryFn: getAssessments,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: getJobs,
    retry: 1,
    refetchOnWindowFocus: false,
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

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      setShowJobModal(false);
      resetJobForm();
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: createAssessment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      // Store created assessment ID to show link
      const assessmentId = data.id;
      console.log('Assessment created with ID:', assessmentId);
      setCreatedAssessmentId(assessmentId);
      // Don't close modal yet - show success with link
      // Reset form
      setAssessmentType('coding');
      setNumQuestions(2);
      setTotalTime(1);
      setMakePublic(true);
      setManualQuestions([]);
      setAssessmentInstructions('');
      // Keep selectedJobId for link generation
    },
  });

  const handleDelete = (assessmentId) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      deleteMutation.mutate(assessmentId);
    }
  };


  const handleGoToAssessment = () => {
    const jobId = createdJobId;
    setShowJobModal(false);
    resetJobForm();
    router.push(`/admin/create-assessment?jobId=${jobId}`);
  };

  const handleViewJob = (job) => {
    setSelectedJobForView(job);
    setShowJobAssessmentModal(true);
  };

  const resetJobForm = () => {
    setNewJob({
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
    setCreatedJobId(null);
  };

  // Track form changes
  useEffect(() => {
    if (showJobModal) {
      const hasChanges = newJob.title || newJob.description || newJob.min_experience_years || newJob.max_experience_years;
      setHasUnsavedChanges(hasChanges);
    }
  }, [newJob, showJobModal]);

  // Handle window close/tab switch
  useEffect(() => {
    if (!showJobModal || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e) => {
      // Auto-save as draft when user navigates away
      if (hasUnsavedChanges) {
        // Draft auto-save removed - using new flow with redirect to edit page
        queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showJobModal, hasUnsavedChanges, newJob, editingJob, queryClient]);

  const handleCloseJobModal = () => {
    if (hasUnsavedChanges) {
      setPendingClose(true);
      setShowDiscardModal(true);
    } else {
      setShowJobModal(false);
      resetJobForm();
    }
  };

  const handleSaveDraft = () => {
    // Draft save removed - using new flow with redirect to edit page
    setShowJobModal(false);
    setShowDiscardModal(false);
    resetJobForm();
  };

  const handleDiscard = () => {
    // Discard changes - using new flow with redirect to edit page
    if (hasUnsavedChanges) {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
    }
    setShowJobModal(false);
    setShowDiscardModal(false);
    resetJobForm();
  };

  const handleEditJob = (job) => {
    // Redirect to job edit page instead of showing modal
    router.push(`/admin/jobs/edit?id=${job.id}`);
  };

  const generateJobDescription = async (isImprove = false) => {
    if (isImprove) {
      // For improvement, we need existing description
      if (!newJob.description || !newJob.description.trim()) {
        alert('Please enter a job description first to improve it.');
        return;
      }
    } else {
      // For generation, we need title and experience
      if (!newJob.title || !newJob.yearsOfExperience) {
        alert('Please enter Job Title and Years of Experience first to generate a description.');
        return;
      }
    }

    setIsGeneratingAI(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let improvedDescription = '';
      
      if (isImprove) {
        // Mock improved description - enhance the existing description
        const currentDesc = newJob.description;
        
        // Create an improved version with better structure and formatting
        improvedDescription = `We are seeking an experienced ${newJob.title || 'professional'} with ${newJob.yearsOfExperience || 'relevant'}+ years of experience to join our team.

**Key Responsibilities:**
- Lead and manage ${(newJob.title || 'project').toLowerCase()} initiatives and deliverables
- Collaborate effectively with cross-functional teams to achieve organizational goals
- Develop and implement strategic solutions that drive business value
- Ensure quality deliverables within established deadlines
- ${currentDesc.includes('responsibilities') || currentDesc.includes('duties') ? '' : 'Execute core job functions as outlined in the role requirements'}

**Required Qualifications:**
- ${newJob.yearsOfExperience || 'Relevant'}+ years of professional experience in related field
- Strong problem-solving and analytical capabilities
- Excellent written and verbal communication skills
- Proven ability to work collaboratively in team environments
- Demonstrated track record of success in similar roles
${currentDesc.includes('qualifications') || currentDesc.includes('requirements') ? '' : '- Additional qualifications as specified in the job description'}

**Preferred Skills:**
- Industry-recognized certifications and credentials
- Advanced technical knowledge and expertise
- Leadership and mentorship capabilities
- Continuous learning mindset and adaptability

**About the Role:**
${currentDesc}

Join us and be part of an innovative team that values excellence, collaboration, and professional growth.`;
      } else {
        // Mock generated description
        improvedDescription = `We are seeking an experienced ${newJob.title} with ${newJob.yearsOfExperience}+ years of experience to join our team.

**Key Responsibilities:**
- Lead and manage ${newJob.title.toLowerCase()} initiatives
- Collaborate with cross-functional teams
- Develop and implement strategic solutions
- Ensure quality deliverables within deadlines

**Required Qualifications:**
- ${newJob.yearsOfExperience}+ years of relevant experience
- Strong problem-solving and analytical skills
- Excellent communication and collaboration abilities
- Proven track record of success in similar roles

**Preferred Skills:**
- Industry certifications
- Advanced technical knowledge
- Leadership experience

Join us and be part of an innovative team driving excellence in our industry.`;
      }

      setNewJob({ ...newJob, description: improvedDescription });
    } catch (error) {
      console.error('Error generating/improving job description:', error);
      alert(`Failed to ${isImprove ? 'improve' : 'generate'} job description. Please try again or paste your existing JD.`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    try {
      setIsGeneratingAI(true);
      
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source for Next.js compatibility
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      // Set the extracted text to the description field
      setNewJob({ ...newJob, description: fullText.trim() });
      
      alert('PDF text extracted successfully!');
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Failed to parse PDF. Please try again or paste the text manually.');
    } finally {
      setIsGeneratingAI(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteJob = (jobId) => {
    if (confirm('Are you sure you want to delete this job? This will also delete associated assessments.')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleJobTitleClick = (job) => {
    // Redirect to job edit page
    router.push(`/admin/jobs/edit?id=${job.id}`);
  };


  const handleJobSubmit = (e) => {
    e?.preventDefault();
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: newJob });
    } else {
      createJobMutation.mutate(newJob);
    }
  };

  const getJobAssessments = (jobId) => {
    return (assessmentsData?.data || []).filter(assessment => assessment.jobId === jobId);
  };

  // Filter jobs by status
  const getActiveJobs = () => {
    return (jobsData?.data || []).filter(job => job.status === 'active' || job.status === 'draft' || !job.status);
  };

  const getPastJobs = () => {
    return (jobsData?.data || []).filter(job => job.status === 'closed');
  };

  const addManualQuestion = () => {
    const questionToAdd = { ...newQuestion, id: Date.now() };
    setManualQuestions([...manualQuestions, questionToAdd]);
    setNewQuestion({
      type: 'coding',
      question: '',
      testCases: '',
      expectedOutput: '',
      options: [],
      correctAnswer: ''
    });
  };

  const handleAIGenerate = () => {
    // Simulate AI question generation
    const generatedQuestions = Array.from({ length: parseInt(aiQuestionCount) || 5 }, (_, i) => ({
      id: `ai-${Date.now()}-${i}`,
      type: 'mcq',
      question: `${aiPrompt || 'AI Generated Question'} ${i + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      difficulty: aiDifficulty,
    }));
    setManualQuestions([...manualQuestions, ...generatedQuestions]);
    setShowAIModal(false);
    setAiPrompt('');
  };

  const handleSaveAssessment = () => {
    if (!selectedJobId) {
      alert('Please select a job first');
      return;
    }
    
    // Get selected job from jobsData
    const selectedJob = jobsData?.data?.find(j => j.id === selectedJobId);
    
    if (!selectedJob) {
      alert('Selected job not found. Please select a valid job.');
      return;
    }
    
    const assessmentData = {
      title: `${selectedJob.title} Assessment`,
      description: `Assessment for ${selectedJob.title}`,
      duration: parseInt(totalTime) || 60,
      questions: manualQuestions.length || parseInt(numQuestions) || 0,
      status: makePublic ? 'published' : 'draft',
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      instructions: assessmentInstructions || '',
      questionTypes: [
        { type: assessmentType, count: manualQuestions.length || parseInt(numQuestions) || 0 }
      ],
      questionData: manualQuestions,
    };

    createAssessmentMutation.mutate(assessmentData);
  };

  // Get active assessments from API data
  const getActiveAssessments = () => {
    const allAssessments = assessmentsData?.data || [];

    // Filter for active assessments (published, draft, active, or no status - everything except archived)
    return allAssessments
      .filter(a => a.status !== 'archived' && a.status !== 'completed')
      .map((assessment, index) => ({
        id: assessment.id || `assessment-${index}`,
        title: assessment.title || 'Untitled Assessment',
        jobTitle: assessment.jobTitle || assessment.title || 'No Job',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ),
        description: assessment.description || 'No description available',
        details: `${assessment.questions || 0} questions • ${assessment.duration || 60} minutes`,
        completed: 0, // TODO: Get from actual data
        invitations: 0, // TODO: Get from actual data
        assessment: assessment, // Store full assessment object
      }));
  };

  const activeAssessments = getActiveAssessments();

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
    <AdminLayout title="Assessments">
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
              {activeAssessments.length > 0 ? (
                activeAssessments.map((assessment, index) => (
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
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 
                                onClick={() => router.push(`/admin/assessment-view?id=${assessment.id}`)}
                                className="text-2xl font-bold text-white cursor-pointer hover:text-orange-400 transition-colors"
                              >
                                {assessment.title}
                              </h3>
                              {assessment.jobTitle && (
                                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-semibold">
                                  {assessment.jobTitle}
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                assessment.assessment?.status === 'published' ? 'bg-green-500/20 text-green-400' :
                                assessment.assessment?.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {assessment.assessment?.status || 'active'}
                              </span>
                            </div>
                            <p className="text-gray-400 mb-2">{assessment.description}</p>
                            <p className="text-sm text-gray-500">{assessment.details}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => router.push(`/admin/create-assessment?assessmentId=${assessment.id}`)}
                              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(assessment.id)}
                              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Questions</span>
                            <span className="font-bold text-white">{assessment.assessment?.questions || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Duration</span>
                            <span className="font-bold text-white">{assessment.assessment?.duration || 60} min</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-3 text-white">No active assessments yet</h3>
                  <p className="text-gray-400 mb-6">Create your first assessment to get started</p>
                  <button
                    onClick={() => router.push('/admin/create-assessment')}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                  >
                    Create Assessment
                  </button>
                </motion.div>
              )}
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

             {/* Jobs Subtabs */}
             <div className="flex gap-4 mb-6">
               <button
                 onClick={() => setActiveJobsTab('active')}
                 className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                   activeJobsTab === 'active'
                     ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                     : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                 }`}
               >
                 Active Jobs ({getActiveJobs().length})
               </button>
               <button
                 onClick={() => setActiveJobsTab('past')}
                 className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                   activeJobsTab === 'past'
                     ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/40'
                     : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                 }`}
               >
                 Past Jobs ({getPastJobs().length})
               </button>
             </div>

             <div className="flex justify-end mb-6">
               <button
                 onClick={async () => {
                   try {
                     console.log('Creating draft job...');
                     const result = await createDraftJob();
                     console.log('Draft job created:', result);
                     // Navigate to edit page
                     const editUrl = `/admin/jobs/edit?id=${result.id}`;
                     console.log('Navigating to:', editUrl);
                     window.location.href = editUrl;
                   } catch (error) {
                     console.error('Failed to create draft job - Full error:', error);
                     console.error('Error response:', error.response);
                     console.error('Error data:', error.response?.data);
                     alert(`Failed to create job: ${error.response?.data?.message || error.message}`);
                   }
                 }}
                 className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95 flex items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
                 Create New Job
               </button>
             </div>

             {/* Active Jobs Tab */}
             {activeJobsTab === 'active' && (
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
                 ) : getActiveJobs().length > 0 ? (
                   getActiveJobs().map((job, index) => (
                     <motion.div
                       key={job.id || index}
                       className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/10 rounded-2xl p-6 overflow-visible hover:border-orange-500/50 transition-all shadow-lg"
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3, delay: index * 0.1 }}
                       whileHover={{ y: -4, shadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
                     >
                       <div className="flex items-start gap-5">
                         <div className="w-16 h-16 bg-gradient-to-br from-orange-500/30 to-orange-600/30 border-2 border-orange-500/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                           <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                           </svg>
                         </div>
                         <div className="flex-1 min-w-0">
                           {/* Job Title - Clickable */}
                           <h3 
                             onClick={() => handleJobTitleClick(job)}
                             className="text-2xl font-bold text-white mb-4 cursor-pointer hover:text-orange-400 transition-colors"
                           >
                             {job.title || 'Untitled Job'}
                           </h3>
                           
                           {/* Years of Experience */}
                           {job.yearsOfExperience && (
                             <div className="flex items-center gap-2 mb-4">
                               <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                               <span className="text-sm text-gray-400">Years of Experience:</span>
                               <span className="text-base font-semibold text-white">{job.yearsOfExperience} years</span>
                             </div>
                           )}
                         </div>

                         {/* Right Side: Status Badge, Action Buttons, and 3-dot Menu */}
                         <div className="flex items-start gap-3 flex-shrink-0">
                           {/* Status Badge */}
                           <div className={`relative px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
                             job.status === 'active' 
                               ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                               : job.status === 'draft' 
                               ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30' :
                               'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                           }`}>
                             {job.status === 'active' && (
                               <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                             )}
                             {job.status || 'active'}
                           </div>

                          {/* Edit and Delete Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditJob(job)}
                              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-all text-sm font-medium text-blue-300 flex items-center gap-1.5"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all text-sm font-medium text-red-300 flex items-center gap-1.5"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
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
                     <h3 className="text-2xl font-bold mb-3 text-white">No active jobs yet</h3>
                     <p className="text-gray-400 mb-6">Create your first job to get started</p>
                     <button
                       onClick={() => {
                         resetJobForm();
                         setShowJobModal(true);
                       }}
                       className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                     >
                       Create Job
                     </button>
                   </motion.div>
                 )}
               </div>
             )}

             {/* Past Jobs Tab */}
             {activeJobsTab === 'past' && (
               <div className="space-y-4">
                 {getPastJobs().length > 0 ? (
                   getPastJobs().map((job, index) => (
                     <motion.div
                       key={job.id || index}
                       className="group relative bg-black/90 border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-gray-500/50 transition-all opacity-75"
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 0.75, y: 0 }}
                       transition={{ duration: 0.3, delay: index * 0.1 }}
                     >
                       <div className="flex items-start gap-6">
                         <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                           <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                           </svg>
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-start justify-between mb-3">
                             <div className="flex-1 min-w-0">
                               <h3 className="text-2xl font-bold text-white mb-2">{job.title || 'Untitled Job'}</h3>
                               {job.company && (
                                 <p className="text-gray-400 mb-2">{job.company} • {job.location || 'Location not specified'}</p>
                               )}
                               <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-xs font-semibold">
                                 Closed
                               </span>
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
                     <h3 className="text-2xl font-bold mb-3 text-white">No past jobs</h3>
                     <p className="text-gray-400">Closed jobs will appear here</p>
                   </motion.div>
                 )}
               </div>
             )}
           </>
         )}

      {/* New Assessment Modal */}
      <AnimatePresence>
        {showNewAssessment && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowNewAssessment(false);
              setCreatedAssessmentId(null);
              setSelectedJobId('');
              setManualQuestions([]);
              setAssessmentInstructions('');
            }}
          >
            <motion.div
              className="group relative bg-black/90 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative z-20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">New Assessment</h2>
                  <button
                    onClick={() => {
                      setShowNewAssessment(false);
                      setCreatedAssessmentId(null);
                      setSelectedJobId('');
                      setManualQuestions([]);
                      setAssessmentInstructions('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveAssessment(); }} className="space-y-6">
                  {/* Job Selection */}
                  <div>
                    <label className="block text-sm mb-3 text-gray-300">Job *</label>
                    <GlassSelect
                      value={selectedJobId}
                      onChange={(value) => setSelectedJobId(value)}
                      placeholder="Select a job"
                      options={[
                        { value: '', label: 'Select a job' },
                        ...(jobsData?.data?.map((job) => ({ 
                          value: job.id, 
                          label: `${job.title}${job.company ? ` - ${job.company}` : ''}` 
                        })) || [])
                      ]}
                      required
                    />
                    {!selectedJobId && jobsData?.data?.length === 0 && (
                      <p className="mt-2 text-sm text-orange-400">
                        No jobs available. <button 
                          type="button"
                          onClick={() => {
                            setShowNewAssessment(false);
                            setShowJobModal(true);
                          }}
                          className="underline hover:text-orange-300"
                        >
                          Create a job first
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Assessment Type */}
                  <div>
                    <label className="block text-sm mb-3 text-gray-300">Assessment Type</label>
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
                      <label className="block text-sm mb-3 text-gray-300">Number of Questions</label>
                      <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-gray-300">Total Time (minutes)</label>
                      <input
                        type="number"
                        value={totalTime}
                        onChange={(e) => setTotalTime(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                        placeholder="e.g., 60"
                      />
                    </div>
                  </div>

                  {/* Instructions Field */}
                  <div>
                    <label className="block text-sm mb-3 text-gray-300">Assessment Instructions</label>
                    <textarea
                      value={assessmentInstructions}
                      onChange={(e) => setAssessmentInstructions(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 min-h-[120px] resize-y text-white placeholder-gray-500"
                      placeholder="Enter instructions for candidates..."
                    />
                  </div>

                  {/* Questions Section */}
                  <div>
                    <label className="block text-sm mb-3 text-gray-300">Add Questions</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {}}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300"
                      >
                        Upload CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAIModal(true)}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300"
                      >
                        Generate with AI
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManualModal(true)}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300"
                      >
                        Write Manually
                      </button>
                    </div>
                    {manualQuestions.length > 0 && (
                      <p className="mt-2 text-sm text-green-400">✓ {manualQuestions.length} question(s) added</p>
                    )}
                  </div>

                  {/* Success Message with Link */}
                  {createdAssessmentId ? (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div>
                        <label className="block text-sm mb-3 text-gray-300">Assessment Link</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/user/assessment?assessmentId=${createdAssessmentId}`}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                            onClick={(e) => e.target.select()}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/user/assessment?assessmentId=${createdAssessmentId}`;
                              navigator.clipboard.writeText(link);
                              alert('Link copied to clipboard!');
                            }}
                            className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-all text-sm text-orange-300"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewAssessment(false);
                            setCreatedAssessmentId(null);
                            setSelectedJobId('');
                            setManualQuestions([]);
                            setAssessmentInstructions('');
                          }}
                          className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm text-white"
                        >
                          Done
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/user/assessment?assessmentId=${createdAssessmentId}`;
                            window.open(link, '_blank');
                          }}
                          className="flex-1 px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-all text-sm text-orange-300"
                        >
                          Open Assessment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={makePublic}
                            onChange={(e) => setMakePublic(e.target.checked)}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 focus:ring-2"
                          />
                          <span className="text-white text-sm">Make it Public</span>
                        </label>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewAssessment(false);
                              setSelectedJobId('');
                              setManualQuestions([]);
                              setCreatedAssessmentId(null);
                              setAssessmentInstructions('');
                            }}
                            className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={createAssessmentMutation.isPending || manualQuestions.length === 0 || !selectedJobId}
                            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {createAssessmentMutation.isPending ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </form>
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
                    onClick={handleAIGenerate}
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
                      setShowManualModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                  >
                    Done Adding Questions
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
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseJobModal}
          >
            <motion.div
              className="group relative bg-black/90 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative z-20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">{editingJob ? 'Edit Job' : 'Create New Job'}</h2>
                  <button
                    onClick={handleCloseJobModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleJobSubmit} className="space-y-6">
                  {/* Job Title Search */}
                  <div>
                    <JobTitleSearch
                      onSelect={(jobTitle) => {
                        setSelectedJobTitle(jobTitle);
                        setNewJob(prev => ({
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
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
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
                        setNewJob(prev => ({
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
                        value={newJob.min_experience_years}
                        onChange={(e) => setNewJob({ ...newJob, min_experience_years: e.target.value })}
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
                        value={newJob.max_experience_years}
                        onChange={(e) => setNewJob({ ...newJob, max_experience_years: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-white">Job Description *</label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-sm cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload PDF
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handlePDFUpload}
                          />
                        </label>
                        {newJob.description && newJob.description.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              generateJobDescription(true);
                            }}
                            disabled={isGeneratingAI}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Improve description with AI"
                          >
                            {isGeneratingAI ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Improving...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Improve with AI
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 min-h-[200px] resize-y text-white placeholder-gray-500"
                      placeholder="Paste your existing job description here or upload a PDF file..."
                      required
                    />
                    <p className="mt-1 text-xs text-gray-400">You can paste your existing JD or upload a PDF file to extract text</p>
                  </div>

                  {/* Job Type & Location Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Job Type</label>
                      <select
                        value={newJob.job_type}
                        onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
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
                        value={newJob.location_type}
                        onChange={(e) => setNewJob({ ...newJob, location_type: e.target.value })}
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
                        value={newJob.location_city}
                        onChange={(e) => setNewJob({ ...newJob, location_city: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                        placeholder="San Francisco"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">State</label>
                      <input
                        type="text"
                        value={newJob.location_state}
                        onChange={(e) => setNewJob({ ...newJob, location_state: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Country</label>
                      <input
                        type="text"
                        value={newJob.location_country}
                        onChange={(e) => setNewJob({ ...newJob, location_country: e.target.value })}
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
                          value={newJob.salary_min}
                          onChange={(e) => setNewJob({ ...newJob, salary_min: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                          placeholder="Min (120000)"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={newJob.salary_max}
                          onChange={(e) => setNewJob({ ...newJob, salary_max: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                          placeholder="Max (180000)"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newJob.salary_currency}
                          onChange={(e) => setNewJob({ ...newJob, salary_currency: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                          placeholder="USD"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Field - Only show when editing */}
                  {editingJob && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Status</label>
                      <GlassSelect
                        value={newJob.status}
                        onChange={(value) => setNewJob({ ...newJob, status: value })}
                        options={[
                          { value: 'draft', label: 'Draft' },
                          { value: 'active', label: 'Active' },
                          { value: 'closed', label: 'Closed' }
                        ]}
                        placeholder="Select status"
                      />
                    </div>
                  )}

                  {createdJobId ? (
                    <div className="space-y-4">
                      <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                        <p className="text-green-400 font-semibold">Job created successfully!</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoToAssessment}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Go to Assessment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowJobModal(false);
                          resetJobForm();
                        }}
                        className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseJobModal}
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
                        disabled={createJobMutation.isPending || updateJobMutation.isPending}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {createJobMutation.isPending || updateJobMutation.isPending ? 'Saving...' : editingJob ? 'Update' : 'Save'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Details View Modal */}
      <AnimatePresence>
        {showJobAssessmentModal && selectedJobForView && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowJobAssessmentModal(false);
              setSelectedJobForView(null);
            }}
          >
            <motion.div
              className="relative bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedJobForView.title || 'Untitled Job'}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedJobForView.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                      selectedJobForView.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedJobForView.status || 'active'}
                    </span>
                    {selectedJobForView.yearsOfExperience && (
                      <span className="text-gray-400 text-sm">
                        {selectedJobForView.yearsOfExperience} years experience
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowJobAssessmentModal(false);
                    setSelectedJobForView(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Description */}
                {selectedJobForView.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <p className="text-gray-300 whitespace-pre-wrap">{selectedJobForView.description}</p>
                    </div>
                  </div>
                )}

                {/* Job Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Job Details</h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                    {selectedJobForView.company && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-32">Company:</span>
                        <span className="text-white">{selectedJobForView.company}</span>
                      </div>
                    )}
                    {selectedJobForView.location && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-32">Location:</span>
                        <span className="text-white">{selectedJobForView.location}</span>
                      </div>
                    )}
                    {selectedJobForView.type && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-32">Job Type:</span>
                        <span className="text-white capitalize">{selectedJobForView.type}</span>
                      </div>
                    )}
                    {selectedJobForView.salary && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-32">Salary:</span>
                        <span className="text-white">{selectedJobForView.salary}</span>
                      </div>
                    )}
                    {selectedJobForView.yearsOfExperience && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-32">Experience:</span>
                        <span className="text-white">{selectedJobForView.yearsOfExperience} years</span>
                      </div>
                    )}
                    {selectedJobForView.postedAt && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-32">Posted:</span>
                        <span className="text-white">{new Date(selectedJobForView.postedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Associated Assessments */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Associated Assessments ({getJobAssessments(selectedJobForView.id).length})
                  </h3>
                  {getJobAssessments(selectedJobForView.id).length > 0 ? (
                    <div className="space-y-3">
                      {getJobAssessments(selectedJobForView.id).map((assessment) => (
                        <div
                          key={assessment.id}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">{assessment.title}</h4>
                              <p className="text-gray-400 text-sm">{assessment.description}</p>
                              <div className="flex gap-3 mt-2 text-sm text-gray-400">
                                <span>Duration: {assessment.duration} min</span>
                                <span>Questions: {assessment.questions || assessment.questionData?.length || 0}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setShowJobAssessmentModal(false);
                                router.push(`/admin/assessment-view?id=${assessment.id}`);
                              }}
                              className="ml-4 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-all text-sm font-medium"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-400">
                      <p className="mb-4">No assessments created for this job yet</p>
                      <button
                        onClick={() => {
                          setShowJobAssessmentModal(false);
                          router.push(`/admin/create-assessment?jobId=${selectedJobForView.id}`);
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
                      >
                        Create Assessment
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setShowJobAssessmentModal(false);
                      handleEditJob(selectedJobForView);
                    }}
                    className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-all font-semibold text-white"
                  >
                    Edit Job
                  </button>
                  <button
                    onClick={() => {
                      setShowJobAssessmentModal(false);
                      router.push(`/admin/create-assessment?jobId=${selectedJobForView.id}`);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
                  >
                    Create Assessment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default AssessmentList;

