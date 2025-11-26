'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSave, FiArrowLeft, FiPlus, FiTrash2, FiCpu,
  FiFileText, FiCode, FiVideo, FiCheckCircle, FiClock, FiSettings,
  FiChevronDown, FiCopy, FiBriefcase
} from 'react-icons/fi';
import {
  getAssessment,
  patchAssessment,
  publishAssessment,
  getAssessmentQuestions,
  createQuestion,
  deleteQuestion,
  getQuestionTemplates,
  addTemplateToAssessment,
  getJobs,
} from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';
import JobTitleSearch from '../../components/JobTitleSearch';

// Difficulty options
const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Very Easy' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Very Hard' },
];

// Reusable glass select component
const GlassSelect = ({ value, onChange, options, placeholder = 'Select', className = '' }) => {
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
        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 text-gray-300 flex items-center justify-between"
      >
        <span className={selected ? 'text-gray-200' : 'text-gray-500'}>{selected ? selected.label : placeholder}</span>
        <FiChevronDown className={`w-4 h-4 text-orange-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden border border-orange-500/30 backdrop-blur-md bg-black/90">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-orange-500/20 text-white' : 'text-gray-200 hover:bg-white/10'}`}
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

// Question type icon component
const QuestionTypeIcon = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case 'mcq': return <FiCheckCircle className={className} />;
    case 'coding': return <FiCode className={className} />;
    case 'subjective': return <FiFileText className={className} />;
    case 'video': return <FiVideo className={className} />;
    default: return <FiFileText className={className} />;
  }
};

// Loading animation for AI generation
const AIGeneratingOverlay = ({ isVisible, questionCount }) => {
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]"
    >
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 border-4 border-purple-500/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 border-4 border-blue-500/50 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <FiCpu className="absolute inset-0 m-auto w-12 h-12 text-purple-400" />
        </div>
        <motion.h3
          className="text-2xl font-bold text-white mb-2"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Generating {questionCount} Questions...
        </motion.h3>
        <p className="text-gray-400">Our AI is crafting personalized questions for your assessment</p>
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const AssessmentEdit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const assessmentId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState('details');
  const [lastSaved, setLastSaved] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [selectedJobTitleId, setSelectedJobTitleId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    job_title: null,
    duration_minutes: 60,
    start_at: '',
    end_at: '',
    settings: {
      shuffle_questions: false,
      proctoring_enabled: true,
      show_results_immediately: false,
      allow_late_submission: false,
    },
  });
  
  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadRef = useRef(true);
  
  // Question management state
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkAIModal, setShowBulkAIModal] = useState(false);
  
  // Manual question state
  const [manualQuestion, setManualQuestion] = useState({
    type: 'mcq',
    content: {
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
    },
    difficulty: 3,
    scoring: { max_marks: 2 },
  });
  
  // Fetch assessment data
  const { data: assessment, isLoading: assessmentLoading, refetch: refetchAssessment } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getAssessment(assessmentId),
    enabled: !!assessmentId,
    retry: 1,
  });
  
  // Fetch questions
  const { data: questions, isLoading: questionsLoading, refetch: refetchQuestions } = useQuery({
    queryKey: ['assessmentQuestions', assessmentId],
    queryFn: () => getAssessmentQuestions(assessmentId),
    enabled: !!assessmentId,
  });
  
  // Fetch question templates for "AI" generation (actually from bank)
  const { data: templatesData } = useQuery({
    queryKey: ['questionTemplates', selectedJobTitleId],
    queryFn: () => getQuestionTemplates({ 
      job_title: selectedJobTitleId,
      page_size: 100 
    }),
    enabled: !!selectedJobTitleId,
  });
  
  // Update form when assessment loads
  useEffect(() => {
    if (assessment && initialLoadRef.current) {
      const startDate = assessment.start_at ? new Date(assessment.start_at).toISOString().slice(0, 16) : '';
      const endDate = assessment.end_at ? new Date(assessment.end_at).toISOString().slice(0, 16) : '';
      
      setFormData({
        name: assessment.name || '',
        description: assessment.description || '',
        instructions: assessment.instructions || '',
        job_title: assessment.job_title || null,
        duration_minutes: assessment.duration_minutes || 60,
        start_at: startDate,
        end_at: endDate,
        settings: assessment.settings || {
          shuffle_questions: false,
          proctoring_enabled: true,
          show_results_immediately: false,
          allow_late_submission: false,
        },
      });
      
      if (assessment.job_title) {
        setSelectedJobTitleId(assessment.job_title);
      }
      if (assessment.role_name) {
        setSelectedRoleName(assessment.role_name);
      }
      
      initialLoadRef.current = false;
    }
  }, [assessment]);
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => patchAssessment(assessmentId, data),
    onSuccess: () => {
      setLastSaved(new Date());
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
    onError: (error) => {
      console.error('Save failed:', error);
    }
  });
  
  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: () => publishAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
  });
  
  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => refetchQuestions(),
  });
  
  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (data) => createQuestion({ assessment: assessmentId, ...data }),
    onSuccess: () => {
      refetchQuestions();
      setShowManualModal(false);
      resetManualQuestion();
    },
    onError: (error) => {
      console.error('Create question failed:', error);
      alert('Failed to create question: ' + (error.response?.data?.error || error.message));
    }
  });
  
  // Add template mutation
  const addTemplateMutation = useMutation({
    mutationFn: ({ templateId }) => addTemplateToAssessment(templateId, assessmentId),
    onSuccess: () => refetchQuestions(),
  });
  
  const resetManualQuestion = () => {
    setManualQuestion({
      type: 'mcq',
      content: {
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
      },
      difficulty: 3,
      scoring: { max_marks: 2 },
    });
  };
  
  // Handle form field change
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);
  
  // Save function
  const handleSave = useCallback(() => {
    if (!assessmentId || !isDirty) return;
    
    const dataToSave = {
      name: formData.name,
      description: formData.description,
      instructions: formData.instructions,
      job_title: selectedJobTitleId,
      duration_minutes: formData.duration_minutes,
      settings: formData.settings,
    };
    
    if (formData.start_at) {
      dataToSave.start_at = new Date(formData.start_at).toISOString();
    }
    if (formData.end_at) {
      dataToSave.end_at = new Date(formData.end_at).toISOString();
    }
    
    saveMutation.mutate(dataToSave);
  }, [assessmentId, formData, selectedJobTitleId, isDirty, saveMutation]);
  
  // Manual save on button click
  const handleManualSave = () => {
    setIsDirty(true); // Force save
    setTimeout(() => handleSave(), 100);
  };
  
  const handleDeleteQuestion = (questionId) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };
  
  const handlePublish = () => {
    if (!selectedJobTitleId) {
      alert('Please select a Role / Job Title before publishing.');
      setActiveTab('details');
      return;
    }
    if (!questions?.length) {
      alert('Please add at least one question before publishing.');
      return;
    }
    if (confirm('Are you sure you want to publish this assessment? It will become available to participants.')) {
      publishMutation.mutate();
    }
  };
  
  const copyShareableLink = () => {
    if (assessment?.unique_link_token) {
      const link = `${window.location.origin}/user/assessment-start?token=${assessment.unique_link_token}`;
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };
  
  const handleCreateManualQuestion = () => {
    // Validate based on type
    if (manualQuestion.type === 'mcq') {
      if (!manualQuestion.content.question?.trim()) {
        alert('Please enter a question');
        return;
      }
      const filledOptions = manualQuestion.content.options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        alert('Please provide at least 2 options');
        return;
      }
    } else if (manualQuestion.type === 'coding') {
      if (!manualQuestion.content.title?.trim()) {
        alert('Please enter a problem title');
        return;
      }
      if (!manualQuestion.content.problem_statement?.trim()) {
        alert('Please enter a problem statement');
        return;
      }
      // Ensure test_cases exists
      if (!manualQuestion.content.test_cases?.length || 
          !manualQuestion.content.test_cases[0]?.input || 
          !manualQuestion.content.test_cases[0]?.output) {
        alert('Please provide at least one test case with input and output');
        return;
      }
    } else if (manualQuestion.type === 'subjective') {
      if (!manualQuestion.content.question?.trim()) {
        alert('Please enter a question');
        return;
      }
    }
    
    // Build the proper content structure
    let content = { ...manualQuestion.content };
    
    // For MCQ, filter out empty options
    if (manualQuestion.type === 'mcq') {
      content.options = content.options.filter(o => o.trim());
    }
    
    const questionData = {
      type: manualQuestion.type,
      content: content,
      scoring: manualQuestion.scoring,
      difficulty: manualQuestion.difficulty,
      tags: [],
    };
    createQuestionMutation.mutate(questionData);
  };
  
  // Simulate AI generation by picking from question bank
  const handleBulkGenerate = async (config) => {
    const { mcq, coding, subjective } = config;
    const totalCount = (mcq?.count || 0) + (coding?.count || 0) + (subjective?.count || 0);
    
    if (totalCount === 0) {
      alert('Please specify at least one question to generate.');
      return;
    }
    
    if (!selectedJobTitleId) {
      alert('Please select a Role / Job Title first to generate relevant questions.');
      setShowBulkAIModal(false);
      setActiveTab('details');
      return;
    }
    
    setIsGenerating(true);
    setGeneratingCount(totalCount);
    setShowBulkAIModal(false);
    
    // Simulate AI generation delay (2-4 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    try {
      // Get templates from bank
      const templates = templatesData?.data || [];
      let addedCount = 0;
      
      // Helper to add questions of a type
      const addQuestionsOfType = async (type, count, difficulty) => {
        const matchingTemplates = templates.filter(t => 
          t.type === type && 
          (difficulty === 'any' || t.difficulty === difficulty)
        );
        
        // Shuffle and pick
        const shuffled = [...matchingTemplates].sort(() => Math.random() - 0.5);
        const toAdd = shuffled.slice(0, count);
        
        for (const template of toAdd) {
          try {
            await addTemplateMutation.mutateAsync({ templateId: template.id });
            addedCount++;
          } catch (e) {
            console.error('Failed to add template:', e);
          }
        }
      };
      
      // Add questions by type
      if (mcq?.count > 0) {
        await addQuestionsOfType('mcq', mcq.count, mcq.difficulty);
      }
      if (coding?.count > 0) {
        await addQuestionsOfType('coding', coding.count, coding.difficulty);
      }
      if (subjective?.count > 0) {
        await addQuestionsOfType('subjective', subjective.count, subjective.difficulty);
      }
      
      await refetchQuestions();
      
      if (addedCount < totalCount) {
        alert(`Generated ${addedCount} questions. Some question types may not have enough templates in the bank for the selected role.`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingCount(0);
    }
  };
  
  if (!assessmentId) {
    return (
      <AdminLayout title="Assessment Edit">
        <div className="text-center py-12">
          <p className="text-gray-400">No assessment ID provided</p>
          <button
            onClick={() => router.push('/admin/assessment-list')}
            className="mt-4 px-6 py-3 bg-orange-500 rounded-xl text-white"
          >
            Back to Assessments
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  if (assessmentLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  const getDifficultyLabel = (value) => {
    const opt = DIFFICULTY_OPTIONS.find(o => o.value === value);
    return opt ? opt.label : 'Medium';
  };
  
  return (
    <AdminLayout
      title={formData.name || 'Edit Assessment'}
      breadcrumbs={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Assessments', path: '/admin/assessment-list' },
        { label: formData.name || 'Edit' },
      ]}
    >
      {/* AI Generation Overlay */}
      <AnimatePresence>
        <AIGeneratingOverlay isVisible={isGenerating} questionCount={generatingCount} />
      </AnimatePresence>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/assessment-list')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{formData.name || 'Untitled Assessment'}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                assessment?.status === 'published' ? 'bg-green-500/20 text-green-400' :
                assessment?.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {assessment?.status?.toUpperCase() || 'DRAFT'}
              </span>
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {saveMutation.isPending && (
                <span className="text-xs text-orange-400">Saving...</span>
              )}
              {isDirty && !saveMutation.isPending && (
                <span className="text-xs text-yellow-400">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSave}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            Save
          </button>
          {assessment?.status === 'published' && assessment?.unique_link_token && (
            <button
              onClick={copyShareableLink}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm flex items-center gap-2"
            >
              <FiCopy className="w-4 h-4" />
              Copy Link
            </button>
          )}
          {assessment?.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={publishMutation.isPending || !questions?.length || !selectedJobTitleId}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={!selectedJobTitleId ? 'Please select a Role first' : !questions?.length ? 'Add questions first' : ''}
            >
              {publishMutation.isPending ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'details'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <FiSettings className="w-4 h-4 inline mr-2" />
          Details
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <FiFileText className="w-4 h-4 inline mr-2" />
          Questions ({questions?.length || 0})
        </button>
      </div>
      
      {/* Details Tab */}
      {activeTab === 'details' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assessment Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="e.g., Frontend Developer Assessment"
            />
          </div>
          
          {/* Role / Job Title - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FiBriefcase className="w-4 h-4 inline mr-1 text-orange-400" />
              Role / Job Title <span className="text-red-400">*</span>
            </label>
            <JobTitleSearch
              value={selectedRoleName}
              onChange={(jobTitleId, jobTitle) => {
                setSelectedJobTitleId(jobTitleId);
                setSelectedRoleName(jobTitle?.name || '');
                handleFieldChange('job_title', jobTitleId);
              }}
              placeholder="Search for a role (e.g., Software Engineer)..."
              label=""
              required={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              Required for competency-based scoring and question recommendations
            </p>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              placeholder="Brief description of the assessment..."
            />
          </div>
          
          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Instructions for Participants</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleFieldChange('instructions', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              placeholder="Instructions that will be shown to participants before they start..."
            />
          </div>
          
          {/* Duration and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => handleFieldChange('duration_minutes', parseInt(e.target.value) || 60)}
                min={1}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.start_at}
                onChange={(e) => handleFieldChange('start_at', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.end_at}
                onChange={(e) => handleFieldChange('end_at', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          
          {/* Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Assessment Settings</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'proctoring_enabled', label: 'Enable Proctoring' },
                { key: 'shuffle_questions', label: 'Shuffle Questions' },
                { key: 'show_results_immediately', label: 'Show Results Immediately' },
                { key: 'allow_late_submission', label: 'Allow Late Submission' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={formData.settings?.[key] ?? false}
                    onChange={(e) => handleFieldChange('settings', { ...formData.settings, [key]: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Add Question Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowBulkAIModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <FiCpu className="w-5 h-5" />
              Generate Questions with AI
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-xl text-orange-400 font-medium flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Manually
            </button>
          </div>
          
          {/* Questions List */}
          <div className="space-y-3">
            {questionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                <FiFileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-white mb-2">No questions yet</h3>
                <p className="text-gray-400 mb-6">Generate questions with AI or add them manually</p>
                <button
                  onClick={() => setShowBulkAIModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold"
                >
                  <FiCpu className="w-4 h-4 inline mr-2" />
                  Generate Questions with AI
                </button>
              </div>
            ) : (
              questions?.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm font-mono">#{index + 1}</span>
                      <div className={`p-2 rounded-lg ${
                        question.type === 'mcq' ? 'bg-green-500/20 text-green-400' :
                        question.type === 'coding' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        <QuestionTypeIcon type={question.type} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {question.title || question.content?.question || question.content?.title || 'Untitled Question'}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-gray-500">{question.type?.toUpperCase()}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{getDifficultyLabel(question.difficulty)}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">Weight: {question.weightage || question.scoring?.max_marks || 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
      
      {/* Manual Question Modal */}
      <AnimatePresence>
        {showManualModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowManualModal(false)}
          >
            <motion.div
              className="bg-black/95 border border-orange-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Add Question Manually</h3>
              
              <div className="space-y-4">
                {/* Question Type */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Question Type</label>
                  <GlassSelect
                    value={manualQuestion.type}
                    onChange={(type) => {
                      let content = {};
                      let scoring = { max_marks: 2 };
                      if (type === 'mcq') {
                        content = { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' };
                        scoring = { max_marks: 2 };
                      } else if (type === 'coding') {
                        content = { title: '', problem_statement: '', test_cases: [], time_limit_ms: 2000, memory_limit_mb: 256 };
                        scoring = { max_marks: 10, partial_marks_enabled: true };
                      } else {
                        content = { question: '', expected_length: 300 };
                        scoring = { max_marks: 10 };
                      }
                      setManualQuestion({ ...manualQuestion, type, content, scoring });
                    }}
                    options={[
                      { value: 'mcq', label: 'Multiple Choice (MCQ)' },
                      { value: 'coding', label: 'Coding' },
                      { value: 'subjective', label: 'Subjective' },
                    ]}
                  />
                </div>
                
                {/* MCQ Fields */}
                {manualQuestion.type === 'mcq' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Question *</label>
                      <textarea
                        value={manualQuestion.content.question || ''}
                        onChange={(e) => setManualQuestion({
                          ...manualQuestion,
                          content: { ...manualQuestion.content, question: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white resize-none"
                        placeholder="Enter your question..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Options *</label>
                      {manualQuestion.content.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name="correct"
                            checked={manualQuestion.content.correct_answer === i}
                            onChange={() => setManualQuestion({
                              ...manualQuestion,
                              content: { ...manualQuestion.content, correct_answer: i }
                            })}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...manualQuestion.content.options];
                              newOptions[i] = e.target.value;
                              setManualQuestion({
                                ...manualQuestion,
                                content: { ...manualQuestion.content, options: newOptions }
                              });
                            }}
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">Select the radio button for the correct answer</p>
                    </div>
                  </>
                )}
                
                {/* Subjective Fields */}
                {manualQuestion.type === 'subjective' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Question *</label>
                    <textarea
                      value={manualQuestion.content.question || ''}
                      onChange={(e) => setManualQuestion({
                        ...manualQuestion,
                        content: { ...manualQuestion.content, question: e.target.value }
                      })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white resize-none"
                      placeholder="Enter your subjective question..."
                    />
                  </div>
                )}
                
                {/* Coding Fields */}
                {manualQuestion.type === 'coding' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Problem Title *</label>
                      <input
                        type="text"
                        value={manualQuestion.content.title || ''}
                        onChange={(e) => setManualQuestion({
                          ...manualQuestion,
                          content: { ...manualQuestion.content, title: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white"
                        placeholder="e.g., Two Sum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Problem Statement *</label>
                      <textarea
                        value={manualQuestion.content.problem_statement || ''}
                        onChange={(e) => setManualQuestion({
                          ...manualQuestion,
                          content: { ...manualQuestion.content, problem_statement: e.target.value }
                        })}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white resize-none"
                        placeholder="Describe the problem..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Sample Test Case</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Input</label>
                          <textarea
                            value={manualQuestion.content.test_cases?.[0]?.input || ''}
                            onChange={(e) => setManualQuestion({
                              ...manualQuestion,
                              content: { 
                                ...manualQuestion.content, 
                                test_cases: [{ 
                                  input: e.target.value, 
                                  output: manualQuestion.content.test_cases?.[0]?.output || '' 
                                }]
                              }
                            })}
                            rows={2}
                            className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-white text-sm resize-none font-mono"
                            placeholder="[1, 2, 3]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Expected Output</label>
                          <textarea
                            value={manualQuestion.content.test_cases?.[0]?.output || ''}
                            onChange={(e) => setManualQuestion({
                              ...manualQuestion,
                              content: { 
                                ...manualQuestion.content, 
                                test_cases: [{ 
                                  input: manualQuestion.content.test_cases?.[0]?.input || '', 
                                  output: e.target.value 
                                }]
                              }
                            })}
                            rows={2}
                            className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-white text-sm resize-none font-mono"
                            placeholder="6"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Difficulty */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                  <GlassSelect
                    value={manualQuestion.difficulty}
                    onChange={(val) => setManualQuestion({ ...manualQuestion, difficulty: val })}
                    options={DIFFICULTY_OPTIONS}
                  />
                </div>
                
                {/* Weightage */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Weightage</label>
                  <input
                    type="number"
                    min={1}
                    value={manualQuestion.scoring.max_marks}
                    onChange={(e) => setManualQuestion({ 
                      ...manualQuestion, 
                      scoring: { ...manualQuestion.scoring, max_marks: parseInt(e.target.value) || 1 }
                    })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowManualModal(false)}
                    className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateManualQuestion}
                    disabled={createQuestionMutation.isPending}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white font-semibold disabled:opacity-50"
                  >
                    {createQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* AI Bulk Generation Modal - Improved */}
      <AnimatePresence>
        {showBulkAIModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBulkAIModal(false)}
          >
            <motion.div
              className="bg-black/95 border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-2">
                <FiCpu className="w-5 h-5 inline mr-2 text-purple-400" />
                Generate Questions with AI
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Specify the number and difficulty of questions for each type.
              </p>
              
              <div className="space-y-6">
                {/* MCQ Section */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiCheckCircle className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-white">Multiple Choice Questions</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Count</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        defaultValue={5}
                        id="bulk-mcq-count"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                      <select
                        id="bulk-mcq-difficulty"
                        defaultValue="any"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                      >
                        <option value="any">Any</option>
                        <option value="2">Easy</option>
                        <option value="3">Medium</option>
                        <option value="4">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Coding Section */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiCode className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-white">Coding Questions</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Count</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        defaultValue={2}
                        id="bulk-coding-count"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                      <select
                        id="bulk-coding-difficulty"
                        defaultValue="any"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                      >
                        <option value="any">Any</option>
                        <option value="2">Easy</option>
                        <option value="3">Medium</option>
                        <option value="4">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Subjective Section */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiFileText className="w-5 h-5 text-purple-400" />
                    <h4 className="font-semibold text-white">Subjective Questions</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Count</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        defaultValue={2}
                        id="bulk-subjective-count"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                      <select
                        id="bulk-subjective-difficulty"
                        defaultValue="any"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                      >
                        <option value="any">Any</option>
                        <option value="2">Easy</option>
                        <option value="3">Medium</option>
                        <option value="4">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {!selectedJobTitleId && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm">
                    ⚠️ Please select a Role / Job Title in the Details tab first to generate relevant questions.
                  </div>
                )}
                
                <button
                  onClick={() => {
                    const mcqCount = parseInt(document.getElementById('bulk-mcq-count')?.value) || 0;
                    const codingCount = parseInt(document.getElementById('bulk-coding-count')?.value) || 0;
                    const subjectiveCount = parseInt(document.getElementById('bulk-subjective-count')?.value) || 0;
                    
                    const mcqDiff = document.getElementById('bulk-mcq-difficulty')?.value;
                    const codingDiff = document.getElementById('bulk-coding-difficulty')?.value;
                    const subjectiveDiff = document.getElementById('bulk-subjective-difficulty')?.value;
                    
                    handleBulkGenerate({
                      mcq: { count: mcqCount, difficulty: mcqDiff === 'any' ? 'any' : parseInt(mcqDiff) },
                      coding: { count: codingCount, difficulty: codingDiff === 'any' ? 'any' : parseInt(codingDiff) },
                      subjective: { count: subjectiveCount, difficulty: subjectiveDiff === 'any' ? 'any' : parseInt(subjectiveDiff) },
                    });
                  }}
                  disabled={!selectedJobTitleId}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Questions
                </button>
              </div>
              
              <button
                onClick={() => setShowBulkAIModal(false)}
                className="mt-4 w-full py-3 bg-white/10 rounded-xl text-white font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AssessmentEdit;
