'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJob, updateJob, publishJob } from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';
import JobTitleSearch from '../../components/JobTitleSearch';
import CompetencySelector from '../../components/CompetencySelector';
import { FiSave, FiSend, FiArrowLeft, FiLoader } from 'react-icons/fi';

const JobEdit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');
  const queryClient = useQueryClient();

  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const saveTimeoutRef = useRef(null);
  const initialFormDataRef = useRef(null);

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

  // Fetch job data
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  });

  // Update form data when job is loaded
  useEffect(() => {
    if (job && !initialFormDataRef.current) {
      // Only set form data once when job loads
      const newFormData = {
        title: job.title || '',
        job_title: job.job_title || '',
        description: job.description || '',
        responsibilities: job.responsibilities || [],
        requirements: job.requirements || [],
        min_experience_years: job.min_experience_years !== undefined ? job.min_experience_years : '',
        max_experience_years: job.max_experience_years !== undefined ? job.max_experience_years : '',
        job_type: job.job_type || 'full_time',
        location_type: job.location_type || 'remote',
        location_city: job.location_city || '',
        location_state: job.location_state || '',
        location_country: job.location_country || '',
        salary_min: job.salary_min !== undefined ? job.salary_min : '',
        salary_max: job.salary_max !== undefined ? job.salary_max : '',
        salary_currency: job.salary_currency || 'USD',
        competency_ids: job.competencies?.map(c => c.competency_id) || [],
      };
      setFormData(newFormData);
      initialFormDataRef.current = newFormData;

      // Set selected job title
      if (job.job_title_name) {
        setSelectedJobTitle({ id: job.job_title, name: job.job_title_name });
      }

      // Set selected competencies for the selector
      if (job.competencies) {
        setSelectedCompetencies(job.competencies.map(c => ({
          id: c.competency_id,
          name: c.competency_name,
          category: c.competency_category,
        })));
      }
    }
  }, [job]);

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: (data) => updateJob(jobId, data),
    onSuccess: () => {
      setLastSaved(new Date());
      setIsSaving(false);
      setHasChanges(false);
      // Update initial form data reference after successful save
      initialFormDataRef.current = formData;
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
      setIsSaving(false);
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: () => publishJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      router.push('/admin/assessment-list?tab=jobs');
    },
  });

  // Debounced auto-save function
  const debouncedAutoSave = useCallback((data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't show "Saving..." indicator until the debounce completes
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      autoSaveMutation.mutate(data);
    }, 1000); // 1 second debounce
  }, [autoSaveMutation]);

  // Auto-save on form data change (only if there are actual changes)
  useEffect(() => {
    if (!initialFormDataRef.current) {
      // Don't auto-save until initial data is loaded
      return;
    }

    // Don't trigger auto-save if we're already saving
    if (isSaving) {
      return;
    }

    // Compare current form data with initial data (last saved state)
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);

    if (hasChanged) {
      setHasChanges(true);
      debouncedAutoSave(formData);
    } else {
      // If no changes, clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setHasChanges(false);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, debouncedAutoSave, isSaving]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePublish = () => {
    if (!formData.title || !formData.job_title || !formData.description) {
      alert('Please fill in required fields: Job Title, Job Posting Title, and Description');
      return;
    }
    if (confirm('Are you sure you want to publish this job? It will be visible to candidates.')) {
      publishMutation.mutate();
    }
  };

  if (!jobId) {
    return (
      <AdminLayout title="Job Edit">
        <div className="text-center py-12">
          <p className="text-red-400">No job ID provided</p>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout title="Job Edit">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading job...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Job">
      {/* Header with save status and actions */}
      <div className="mb-6 flex justify-between items-center sticky top-0 bg-gray-900 z-10 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/assessment-list?tab=jobs')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>

          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin text-orange-400" />
                <span className="text-gray-400">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <FiSave className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              </>
            ) : null}
          </div>

          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">
            DRAFT
          </span>
        </div>

        <button
          onClick={handlePublish}
          disabled={publishMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          <FiSend className="w-5 h-5" />
          {publishMutation.isPending ? 'Publishing...' : 'Publish Job'}
        </button>
      </div>

      {/* Form */}
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Edit Job Posting</h1>

        {/* Job Title Search */}
        <div>
          <JobTitleSearch
            onSelect={(jobTitle) => {
              setSelectedJobTitle(jobTitle);
              handleFieldChange('job_title', jobTitle.id);
              if (!formData.title) {
                handleFieldChange('title', jobTitle.name);
              }
            }}
            value={selectedJobTitle?.name || job?.job_title_name || ''}
          />
        </div>

        {/* Custom Job Posting Title */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Job Posting Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
            placeholder="e.g., Senior Software Engineer - Backend Team"
          />
        </div>

        {/* Competencies Selector */}
        <div>
          <CompetencySelector
            jobTitleId={selectedJobTitle?.id || formData.job_title}
            selectedCompetencies={selectedCompetencies}
            onCompetenciesChange={(comps) => {
              setSelectedCompetencies(comps);
              handleFieldChange('competency_ids', comps.map(c => c.id));
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
              onChange={(e) => handleFieldChange('min_experience_years', e.target.value)}
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
              onChange={(e) => handleFieldChange('max_experience_years', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
              placeholder="10"
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Job Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 min-h-[200px] resize-y text-white placeholder-gray-500"
            placeholder="Paste your job description here..."
          />
        </div>

        {/* Job Type & Location Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Job Type</label>
            <select
              value={formData.job_type}
              onChange={(e) => handleFieldChange('job_type', e.target.value)}
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
              onChange={(e) => handleFieldChange('location_type', e.target.value)}
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
              onChange={(e) => handleFieldChange('location_city', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
              placeholder="San Francisco"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">State</label>
            <input
              type="text"
              value={formData.location_state}
              onChange={(e) => handleFieldChange('location_state', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
              placeholder="CA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Country</label>
            <input
              type="text"
              value={formData.location_country}
              onChange={(e) => handleFieldChange('location_country', e.target.value)}
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
                onChange={(e) => handleFieldChange('salary_min', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="Min (120000)"
              />
            </div>
            <div>
              <input
                type="number"
                value={formData.salary_max}
                onChange={(e) => handleFieldChange('salary_max', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="Max (180000)"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.salary_currency}
                onChange={(e) => handleFieldChange('salary_currency', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="USD"
                maxLength={3}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default JobEdit;
