'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createAssessment, getJobs } from '../../api/admin';
import { jobsStorage, assessmentsStorage } from '../../lib/localStorage';
import AdminLayout from '../../components/AdminLayout';

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

const CreateAssessment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // Fetch jobs for dropdown
  const { data: jobsData } = useQuery({
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    jobId: '',
    status: 'draft',
    questionTypes: [{ type: 'coding', count: 0 }],
  });

  // AI Generation states
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);

  // Manual Question states
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    type: 'coding',
    question: '',
    testCases: '',
    expectedOutput: '',
    options: [],
    correctAnswer: '',
  });

  // All questions tracking
  const [allQuestions, setAllQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-select job from query parameter
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && jobsData?.data) {
      const job = jobsData.data.find(j => j.id === jobId);
      if (job) {
        setFormData(prev => ({
          ...prev,
          jobId: jobId,
          title: job.title, // Auto-fill title from job
        }));
      }
    }
  }, [searchParams, jobsData]);

  const questionTypeOptions = ['coding', 'video', 'mcq', 'essay'];

  const addQuestionType = () => {
    setFormData({
      ...formData,
      questionTypes: [...formData.questionTypes, { type: 'coding', count: 0 }],
    });
  };

  const removeQuestionType = (index) => {
    const updated = formData.questionTypes.filter((_, i) => i !== index);
    setFormData({ ...formData, questionTypes: updated });
  };

  const updateQuestionType = (index, field, value) => {
    const updated = [...formData.questionTypes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, questionTypes: updated });
  };

  const totalQuestions = formData.questionTypes.reduce((sum, qt) => sum + (parseInt(qt.count) || 0), 0);

  const addManualQuestion = () => {
    const questionToAdd = { ...newQuestion, id: Date.now() };
    setManualQuestions([...manualQuestions, questionToAdd]);
    setAllQuestions([...allQuestions, questionToAdd]);
    setNewQuestion({
      type: 'coding',
      question: '',
      testCases: '',
      expectedOutput: '',
      options: [],
      correctAnswer: '',
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
    setAllQuestions([...allQuestions, ...generatedQuestions]);
    console.log('Generating AI questions...', { aiPrompt, aiDifficulty, aiQuestionCount });
    setShowAIModal(false);
    setAiPrompt('');
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Simple CSV parsing - you may want to use a library like papaparse
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const csvQuestions = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          id: `csv-${Date.now()}-${index}`,
          type: 'mcq',
          question: values[0] || `Question ${index + 1}`,
          options: values.slice(1, -1) || [],
          correctAnswer: values[values.length - 1] || '',
        };
      });
      
      setAllQuestions([...allQuestions, ...csvQuestions]);
    };
    reader.readAsText(file);
  };

  const createMutation = useMutation({
    mutationFn: async (assessmentData) => {
      // TODO: Replace with actual API call when backend is ready
      // For now, save to localStorage
      try {
        // Try API first
        const result = await createAssessment(assessmentData);
        // Also save to localStorage as backup
        assessmentsStorage.save({
          ...assessmentData,
          id: result.id || `assessment_${Date.now()}`,
        });
        return result;
      } catch (error) {
        // If API fails, use localStorage
        console.log('API call failed, using localStorage:', error);
        const savedAssessment = assessmentsStorage.save({
          ...assessmentData,
          id: `assessment_${Date.now()}`,
        });
        return savedAssessment;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      router.push('/admin/assessment-list');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedJob = jobsData?.data?.find(j => j.id === formData.jobId);
    
    // If job doesn't exist in API data, check localStorage
    let job = selectedJob;
    if (!job && formData.jobId) {
      job = jobsStorage.getById(formData.jobId);
    }
    
    // If job still doesn't exist but we have jobId, create a basic job entry
    // This handles cases where job was created elsewhere or needs to be saved
    if (!job && formData.jobId) {
      // Try to extract job info from form or create a placeholder
      const newJob = {
        id: formData.jobId,
        title: formData.title || 'Untitled Job',
        company: 'Company',
        location: 'Location',
        type: 'full-time',
        salary: 'Not specified',
        status: 'active',
        postedAt: new Date().toISOString(),
      };
      jobsStorage.save(newJob);
      job = newJob;
    }
    
    const assessmentData = {
      ...formData,
      questions: allQuestions.length > 0 ? allQuestions.length : totalQuestions,
      jobTitle: job?.title || formData.title,
      questionData: allQuestions, // Include all questions data
      jobId: formData.jobId, // Ensure jobId is included
    };
    
    createMutation.mutate(assessmentData);
  };

  return (
    <AdminLayout 
      title="Create Assessment"
      breadcrumbs={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Assessments', path: '/admin/assessment-list' },
        { label: 'Create Assessment' }
      ]}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Create Assessment</h1>
        <p className="text-gray-400">Create a new assessment with AI-generated or manual questions</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <motion.div 
          className="relative bg-black/90 border border-[#FF5728] rounded-3xl p-8"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-3 text-gray-300">Assessment Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                  placeholder="e.g., JavaScript Fundamentals"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-3 text-gray-300">Job *</label>
                <GlassSelect
                  value={formData.jobId}
                  onChange={(value) => setFormData({ ...formData, jobId: value })}
                  placeholder="Select a job"
                  options={[
                    { value: '', label: 'Select a job' },
                    ...(jobsData?.data?.map((job) => ({ value: job.id, label: `${job.title} - ${job.company}` })) || [])
                  ]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-3 text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 resize-none h-32 transition-all placeholder-gray-600 text-white"
                  placeholder="Describe what this assessment covers..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-3 text-gray-300">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                  min="1"
                  required
                />
              </div>

              {/* Question Types Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm text-gray-300">Question Types *</label>
                  <button
                    type="button"
                    onClick={addQuestionType}
                    className="px-3 py-1.5 text-xs bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all"
                  >
                    + Add Type
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.questionTypes.map((qt, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <GlassSelect
                          value={qt.type}
                          onChange={(value) => updateQuestionType(index, 'type', value)}
                          placeholder="Select question type"
                          options={questionTypeOptions.map((type) => ({
                            value: type,
                            label: type.charAt(0).toUpperCase() + type.slice(1)
                          }))}
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={qt.count}
                          onChange={(e) => updateQuestionType(index, 'count', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                          placeholder="Count"
                          min="0"
                          required
                        />
                      </div>
                      {formData.questionTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionType(index)}
                          className="px-4 py-3.5 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  Total Questions: <span className="font-bold text-orange-400">{totalQuestions}</span>
                </div>
              </div>

              {/* Question Adding Options Section */}
              {totalQuestions > 0 && (
                <div>
                  <label className="block text-sm mb-3 text-gray-300">Add Questions</label>
                  <div className="grid grid-cols-3 gap-6">
                    {/* CSV Upload */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
                      <h3 className="font-semibold text-white mb-4">Drop CSV/PDF file</h3>
                      <label className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-orange-500/50 transition-colors cursor-pointer block">
                        <input
                          type="file"
                          accept=".csv,.pdf"
                          onChange={handleCSVUpload}
                          className="hidden"
                        />
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-400 mb-2">Drag &amp; drop CSV/PDF here</p>
                        <p className="text-xs text-gray-500">Upload a .csv or .pdf with questions</p>
                      </label>
                    </div>

                    {/* AI Generate */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
                      <h3 className="font-semibold text-white mb-4">Generate Using AI</h3>
                      <button
                        type="button"
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
                      <h3 className="font-semibold text-white mb-4">Write Manually</h3>
                      <button
                        type="button"
                        onClick={() => setShowManualModal(true)}
                        className="w-full py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                      >
                        Start Writing
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions Summary and Actions */}
              {allQuestions.length > 0 && (
                <div className="bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Added Questions: {allQuestions.length}
                    </h3>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubmit(e);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Save Assessment
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Questions added: {allQuestions.filter(q => q.type === 'mcq').length} MCQ, {allQuestions.filter(q => q.type === 'coding').length} Coding, {allQuestions.filter(q => q.type === 'video').length} Video</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm mb-3 text-gray-300">Status</label>
                <GlassSelect
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  placeholder="Select status"
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'archived', label: 'Archived' }
                  ]}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/assessment-list')}
                  className="flex-1 py-3.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formData.jobId || totalQuestions === 0}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {createMutation.isPending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    'Create Assessment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

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
                  <label className="block text-sm mb-3 text-gray-300">Prompt</label>
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
                    <label className="block text-sm mb-3 text-gray-300">Difficulty</label>
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
                    <label className="block text-sm mb-3 text-gray-300">Number of Questions</label>
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
                  <label className="block text-sm mb-3 text-gray-300">Question Type</label>
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
                  <label className="block text-sm mb-3 text-gray-300">Question</label>
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
                      <label className="block text-sm mb-3 text-gray-300">Test Cases</label>
                      <textarea
                        value={newQuestion.testCases}
                        onChange={(e) => setNewQuestion({ ...newQuestion, testCases: e.target.value })}
                        placeholder="Enter test cases..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none h-24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-gray-300">Expected Output</label>
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
                      <label className="block text-sm mb-3 text-gray-300">Options</label>
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
                      <label className="block text-sm mb-3 text-gray-300">Correct Answer</label>
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
                                const questionToRemove = manualQuestions[idx];
                                const updated = manualQuestions.filter((_, i) => i !== idx);
                                setManualQuestions(updated);
                                setAllQuestions(allQuestions.filter((q) => q.id !== questionToRemove.id));
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
                    Done Adding Questions
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1200] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              className="relative bg-black/95 border border-orange-500/50 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-black/95 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-bold text-white">Assessment Preview</h3>
                  <p className="text-sm text-gray-400 mt-1">{formData.title || 'Untitled Assessment'}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Assessment Info */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Assessment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Title:</span>
                      <p className="text-white mt-1">{formData.title || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <p className="text-white mt-1">{formData.duration} minutes</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Description:</span>
                      <p className="text-white mt-1">{formData.description || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Questions:</span>
                      <p className="text-white mt-1">{allQuestions.length}</p>
                    </div>
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Questions ({allQuestions.length})</h4>
                  {allQuestions.map((question, index) => (
                    <motion.div
                      key={question.id || index}
                      className="bg-white/5 border border-white/10 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg text-sm font-semibold">
                            Q{index + 1}
                          </span>
                          <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-sm font-semibold uppercase">
                            {question.type}
                          </span>
                          {question.difficulty && (
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-semibold capitalize">
                              {question.difficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-white mb-4">
                        <p className="text-lg leading-relaxed">{question.question}</p>
                      </div>

                      {/* MCQ Options */}
                      {question.type === 'mcq' && question.options && question.options.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10"
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-orange-500/50 flex items-center justify-center text-sm font-semibold">
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className="text-gray-300">{option}</span>
                              {option === question.correctAnswer && (
                                <span className="ml-auto bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Coding Question Details */}
                      {question.type === 'coding' && (
                        <div className="space-y-4 mt-4">
                          {question.testCases && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-400 mb-2">Test Cases:</h5>
                              <div className="bg-black/50 rounded-lg p-3 font-mono text-sm text-gray-300">
                                {question.testCases}
                              </div>
                            </div>
                          )}
                          {question.expectedOutput && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-400 mb-2">Expected Output:</h5>
                              <div className="bg-black/50 rounded-lg p-3 font-mono text-sm text-gray-300">
                                {question.expectedOutput}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Video Question */}
                      {question.type === 'video' && (
                        <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <p className="text-sm text-gray-400">This is a video-based question. Candidates will record their response.</p>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {allQuestions.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No questions added yet. Add questions to see the preview.</p>
                    </div>
                  )}
                </div>

                {/* Preview Footer */}
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={(e) => {
                      setShowPreview(false);
                      handleSubmit(e);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                  >
                    Save & Create Assessment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default CreateAssessment;
