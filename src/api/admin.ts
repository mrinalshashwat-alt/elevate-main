import axiosInstance from './axiosInstance';
import { AdminUser, Job, Assessment, PaginatedResponse } from '../types';

type DrfListResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T[];
};

type ParticipantResource = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  total_contests?: number;
  total_score?: number;
};

type JobAdminResource = {
  id: string;
  title: string;
  job_title?: string; // UUID of JobTitle
  job_title_name?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  status?: string;
  job_type?: string;
  location_type?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  salary_currency?: string;
  min_experience_years?: number | string;
  max_experience_years?: number | string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  assessment_count?: number;
  competencies?: Array<{
    competency_id: string;
    competency_name: string;
    competency_category: string;
    importance_level: number;
    is_custom: boolean;
    description?: string;
  }>;
};

type AssessmentAdminResource = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  duration_minutes?: number;
  question_count?: number;
  job?: string | null;
  job_title?: string | null;
  created_at?: string;
  question_distribution?: Record<string, number>;
};

const JOB_TYPE_MAP: Record<string, Job['type']> = {
  full_time: 'full-time',
  part_time: 'part-time',
  contract: 'contract',
  internship: 'internship',
  freelance: 'freelance',
};

const mapJobType = (value?: string): Job['type'] => {
  if (!value) {
    return 'full-time';
  }
  return JOB_TYPE_MAP[value] || 'full-time';
};

const mapJobStatus = (value?: string): Job['status'] => {
  if (!value) {
    return 'draft';
  }
  if (value === 'published' || value === 'draft' || value === 'archived') {
    return value as Job['status'];
  }
  if (value === 'closed') {
    return 'closed';
  }
  if (value === 'active') {
    return 'active';
  }
  return 'draft';
};

const unwrapList = <T>(payload: DrfListResponse<T> | T[]): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const normalizePaginated = <T>(
  payload: DrfListResponse<T>,
  page: number,
  pageSize: number
): PaginatedResponse<T> => {
  const items = unwrapList(payload);
  return {
    data: items,
    total: typeof payload.count === 'number' ? payload.count : items.length,
    page,
    pageSize,
  };
};

const toAdminUser = (participant: ParticipantResource): AdminUser => {
  const fallbackName = participant.name || participant.email?.split('@')[0] || 'Candidate';
  const recentThreshold = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const lastActive = participant.updated_at ? new Date(participant.updated_at).getTime() : 0;

  return {
    id: participant.id,
    name: fallbackName,
    email: participant.email,
    role: 'user',
    status: lastActive > recentThreshold ? 'active' : 'inactive',
    joinedAt: participant.created_at || new Date().toISOString(),
    lastActive: participant.updated_at || participant.created_at || new Date().toISOString(),
  };
};

const formatSalary = (job: JobAdminResource): string => {
  const currency = job.salary_currency || 'USD';
  if (job.salary_min && job.salary_max) {
    return `${currency} ${job.salary_min} - ${job.salary_max}`;
  }
  if (job.salary_min) {
    return `${currency} ${job.salary_min}+`;
  }
  if (job.salary_max) {
    return `${currency} ${job.salary_max}`;
  }
  return 'Not specified';
};

const formatLocation = (job: JobAdminResource): string => {
  const parts = [job.location_city, job.location_state, job.location_country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Remote';
};

const formatExperience = (job: JobAdminResource): string => {
  const min = job.min_experience_years;
  const max = job.max_experience_years;
  if (min !== undefined && max !== undefined && min !== '' && max !== '') {
    return `${min}-${max} years`;
  }
  if (min !== undefined && min !== '') {
    return `${min}+ years`;
  }
  return 'Not specified';
};

const formatLocationType = (locationType?: string): string => {
  const map: Record<string, string> = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    onsite: 'On-site',
  };
  return locationType ? map[locationType] || locationType : 'Remote';
};

const toJob = (job: JobAdminResource): Job => {
  // Extract competency names from the backend response
  let competencyNames: string[] = [];
  if (job.competencies && Array.isArray(job.competencies)) {
    competencyNames = job.competencies.map(c => c.competency_name);
  }

  return {
    id: job.id,
    title: job.title,
    company: job.job_title_name || 'Unspecified',
    location: formatLocation(job),
    type: mapJobType(job.job_type),
    salary: formatSalary(job),
    postedAt: job.published_at || job.created_at || new Date().toISOString(),
    status: mapJobStatus(job.status),
    competencies: competencyNames,
  };
};

// Extended job data for edit page
export interface JobDetailData extends JobAdminResource {
  experience: string;
  locationTypeDisplay: string;
}

export const toJobDetail = (job: JobAdminResource): JobDetailData => ({
  ...job,
  experience: formatExperience(job),
  locationTypeDisplay: formatLocationType(job.location_type),
});

const toAssessment = (assessment: AssessmentAdminResource): Assessment => ({
  id: assessment.id,
  title: assessment.name,
  description: assessment.description || '',
  duration: assessment.duration_minutes || 0,
  questions: assessment.question_count || 0,
  createdAt: assessment.created_at || new Date().toISOString(),
  status: (assessment.status as Assessment['status']) || 'draft',
  jobId: assessment.job || undefined,
  jobTitle: assessment.job_title || undefined,
  questionTypes: assessment.question_distribution
    ? Object.entries(assessment.question_distribution).map(([type, count]) => ({
        type,
        count,
      }))
    : [],
});

export const getAdminDashboard = async (): Promise<any> => {
  const [participantsRes, jobsRes, assessmentsRes] = await Promise.all([
    axiosInstance.get<DrfListResponse<ParticipantResource>>('/admin/participants/', {
      params: { page: 1, page_size: 200 },
    }),
    axiosInstance.get<DrfListResponse<JobAdminResource>>('/admin/jobs/', {
      params: { page: 1, page_size: 5 },
    }),
    axiosInstance.get<DrfListResponse<AssessmentAdminResource>>('/admin/assessments/', {
      params: { page: 1, page_size: 5 },
    }),
  ]);

  const participants = unwrapList(participantsRes.data).map(toAdminUser);
  const jobs = unwrapList(jobsRes.data).map(toJob);
  const assessments = unwrapList(assessmentsRes.data).map(toAssessment);

  const activeThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeUsers = participants.filter((participant) => {
    const lastActive = new Date(participant.lastActive).getTime();
    return lastActive > activeThreshold;
  }).length;

  const recentActivity = [
    ...jobs.map((job) => ({
      id: job.id,
      type: 'job',
      message: `Job "${job.title}" is ${job.status}`,
      timestamp: job.postedAt,
    })),
    ...assessments.map((assessment) => ({
      id: assessment.id,
      type: 'assessment',
      message: `Assessment "${assessment.title}" has ${assessment.questions} questions`,
      timestamp: assessment.createdAt,
    })),
  ]
    .sort((a, b) => (new Date(b.timestamp).getTime() || 0) - (new Date(a.timestamp).getTime() || 0))
    .slice(0, 6);

  return {
    totalUsers: participantsRes.data.count ?? participants.length,
    activeUsers,
    totalJobs: jobsRes.data.count ?? jobs.length,
    totalAssessments: assessmentsRes.data.count ?? assessments.length,
    recentActivity,
  };
};

export const getUsers = async (page = 1, pageSize = 10): Promise<PaginatedResponse<AdminUser>> => {
  const { data } = await axiosInstance.get<DrfListResponse<ParticipantResource>>('/admin/participants/', {
    params: { page, page_size: pageSize },
  });
  const normalized = normalizePaginated(data, page, pageSize);
  return {
    ...normalized,
    data: normalized.data.map(toAdminUser),
  };
};

export const createUser = async (): Promise<AdminUser> => {
  throw new Error('User management via API is not available yet.');
};

export const updateUser = async (): Promise<AdminUser> => {
  throw new Error('User management via API is not available yet.');
};

export const deleteUser = async (): Promise<void> => {
  throw new Error('User management via API is not available yet.');
};

export const getJobs = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Job>> => {
  const { data } = await axiosInstance.get<DrfListResponse<JobAdminResource>>('/admin/jobs/', {
    params: { page, page_size: pageSize },
  });
  const normalized = normalizePaginated(data, page, pageSize);
  return {
    ...normalized,
    data: normalized.data.map(toJob),
  };
};

export const createJob = async (jobData: Partial<Job>): Promise<Job> => {
  const response = await axiosInstance.post<JobAdminResource>('/admin/jobs/', jobData);
  return toJob(response.data);
};

export const updateJob = async (jobId: string, jobData: Partial<Job>): Promise<Job> => {
  const response = await axiosInstance.patch<JobAdminResource>(`/admin/jobs/${jobId}/`, jobData);
  return toJob(response.data);
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await axiosInstance.delete(`/admin/jobs/${jobId}/`);
};

export const getAssessments = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Assessment>> => {
  const { data } = await axiosInstance.get<DrfListResponse<AssessmentAdminResource>>('/admin/assessments/', {
    params: { page, page_size: pageSize },
  });
  const normalized = normalizePaginated(data, page, pageSize);
  return {
    ...normalized,
    data: normalized.data.map(toAssessment),
  };
};

const buildAssessmentPayload = (assessmentData: Partial<Assessment>) => {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    name: assessmentData.title,
    description: assessmentData.description || 'Assessment generated from admin panel.',
    instructions: 'Complete all questions within the allotted time.',
    job: assessmentData.jobId || null,
    start_at: assessmentData.createdAt || now.toISOString(),
    end_at: inSevenDays.toISOString(),
    duration_minutes: assessmentData.duration || 60,
    settings: {
      shuffle_questions: true,
    },
  };
};

export const createAssessment = async (assessmentData: Partial<Assessment>): Promise<Assessment> => {
  const payload = buildAssessmentPayload(assessmentData);
  const response = await axiosInstance.post<AssessmentAdminResource>('/admin/assessments/', payload);
  return toAssessment(response.data);
};

export const updateAssessment = async (assessmentId: string, assessmentData: Partial<Assessment>): Promise<Assessment> => {
  const payload = buildAssessmentPayload(assessmentData);
  const response = await axiosInstance.put<AssessmentAdminResource>(`/admin/assessments/${assessmentId}/`, payload);
  return toAssessment(response.data);
};

export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  await axiosInstance.delete(`/admin/assessments/${assessmentId}/`);
};

// Competency and Job Title APIs
export interface JobTitleResource {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  seniority_level: string;
  competency_count: number;
}

export interface CompetencyResource {
  id: string;
  name: string;
  description: string;
  category: string;
  skill_level?: string;
  industry?: string;
  is_active: boolean;
}

export interface JobTitleCompetencyResource {
  id: string;
  competency_id: string;
  competency_name: string;
  competency_description: string;
  competency_category: string;
  importance_level: number;
  required_proficiency?: string;
}

export const searchJobTitles = async (query: string): Promise<JobTitleResource[]> => {
  const { data } = await axiosInstance.get<DrfListResponse<JobTitleResource>>('/competencies/job-titles/', {
    params: { search: query },
  });
  return unwrapList(data);
};

export const getJobTitleCompetencies = async (jobTitleId: string): Promise<JobTitleCompetencyResource[]> => {
  const { data } = await axiosInstance.get(`/competencies/job-titles/${jobTitleId}/competencies/`);
  return data.competencies || [];
};

export const searchCompetencies = async (query: string, category?: string): Promise<CompetencyResource[]> => {
  const { data } = await axiosInstance.get<DrfListResponse<CompetencyResource>>('/competencies/competencies/', {
    params: { search: query, ...(category && { category }) },
  });
  return unwrapList(data);
};

// Job Edit Functions
export const createDraftJob = async (jobTitleId?: string): Promise<{ id: string }> => {
  const { data } = await axiosInstance.post('/admin/jobs/create_draft/', {
    job_title: jobTitleId,
  });
  return data;
};

export const getJob = async (jobId: string): Promise<any> => {
  const { data } = await axiosInstance.get(`/admin/jobs/${jobId}/`);
  return data;
};

export const publishJob = async (jobId: string): Promise<any> => {
  const { data } = await axiosInstance.post(`/admin/jobs/${jobId}/publish/`);
  return data;
};

export const improveJobDescription = async (jobId: string, description: string): Promise<string> => {
  const { data } = await axiosInstance.post(`/admin/jobs/${jobId}/improve_description/`, {
    description,
  });
  return data.improved_description;
};

// =====================================================
// Assessment Draft & Edit APIs
// =====================================================

export interface AssessmentDetailResource {
  id: string;
  name: string;
  description: string;
  instructions: string;
  job?: string | null;
  job_title?: string | null;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  status: string;
  settings: Record<string, any>;
  unique_link_token: string;
  question_distribution?: Record<string, number>;
  total_marks?: number;
  created_at: string;
  updated_at?: string;
}

export interface QuestionResource {
  id: string;
  type: 'mcq' | 'coding' | 'subjective';
  content: Record<string, any>;
  scoring: Record<string, any>;
  difficulty: number;
  tags: string[];
  order: number;
  weightage: string;
  title?: string;
  max_marks?: number;
}

export interface QuestionTemplateResource {
  id: string;
  type: 'mcq' | 'coding' | 'subjective';
  title: string;
  content: Record<string, any>;
  scoring: Record<string, any>;
  difficulty: number;
  tags: string[];
  competency?: string | null;
  competency_name?: string | null;
  job_title?: string | null;
  job_title_name?: string | null;
  usage_count: number;
  is_active: boolean;
  max_marks?: number;
}

/**
 * Create a draft assessment and get UUID for immediate redirect
 */
export const createDraftAssessment = async (data: {
  name?: string;
  job?: string;
}): Promise<{ id: string; name: string; status: string; unique_link_token: string }> => {
  const response = await axiosInstance.post('/admin/assessments/create_draft/', data);
  return response.data;
};

/**
 * Get assessment details by ID
 */
export const getAssessment = async (assessmentId: string): Promise<AssessmentDetailResource> => {
  const { data } = await axiosInstance.get(`/admin/assessments/${assessmentId}/`);
  return data;
};

/**
 * Update assessment (PATCH for auto-save)
 */
export const patchAssessment = async (
  assessmentId: string,
  updateData: Partial<{
    name: string;
    description: string;
    instructions: string;
    job: string | null;
    start_at: string;
    end_at: string;
    duration_minutes: number;
    settings: Record<string, any>;
  }>
): Promise<AssessmentDetailResource> => {
  const { data } = await axiosInstance.patch(`/admin/assessments/${assessmentId}/`, updateData);
  return data;
};

/**
 * Publish an assessment
 */
export const publishAssessment = async (assessmentId: string): Promise<any> => {
  const { data } = await axiosInstance.post(`/admin/assessments/${assessmentId}/publish/`);
  return data;
};

/**
 * Get assessment preview with all questions
 */
export const getAssessmentPreview = async (assessmentId: string): Promise<{
  assessment: any;
  questions: QuestionResource[];
}> => {
  const { data } = await axiosInstance.get(`/admin/assessments/${assessmentId}/preview/`);
  return data;
};

/**
 * Reorder questions in an assessment
 */
export const reorderQuestions = async (
  assessmentId: string,
  questionIds: string[]
): Promise<{ success: boolean; message: string }> => {
  const { data } = await axiosInstance.post(`/admin/assessments/${assessmentId}/reorder_questions/`, {
    question_ids: questionIds,
  });
  return data;
};

/**
 * Update question weightages
 */
export const updateWeightages = async (
  assessmentId: string,
  weightages: Record<string, number>
): Promise<{ success: boolean; updated: number; errors: any[] }> => {
  const { data } = await axiosInstance.post(`/admin/assessments/${assessmentId}/update_weightages/`, {
    weightages,
  });
  return data;
};

// =====================================================
// Question APIs
// =====================================================

/**
 * Get questions for an assessment
 */
export const getAssessmentQuestions = async (assessmentId: string): Promise<QuestionResource[]> => {
  const { data } = await axiosInstance.get('/admin/questions/', {
    params: { assessment: assessmentId },
  });
  return unwrapList(data);
};

/**
 * Create a question manually
 */
export const createQuestion = async (questionData: {
  assessment: string;
  type: string;
  content: Record<string, any>;
  scoring: Record<string, any>;
  difficulty: number;
  tags?: string[];
  order?: number;
  weightage?: number;
}): Promise<QuestionResource> => {
  const { data } = await axiosInstance.post('/admin/questions/', questionData);
  return data;
};

/**
 * Update a question
 */
export const updateQuestion = async (
  questionId: string,
  updateData: Partial<QuestionResource>
): Promise<QuestionResource> => {
  const { data } = await axiosInstance.patch(`/admin/questions/${questionId}/`, updateData);
  return data;
};

/**
 * Delete a question
 */
export const deleteQuestion = async (questionId: string): Promise<void> => {
  await axiosInstance.delete(`/admin/questions/${questionId}/`);
};

/**
 * Generate a question using AI
 */
export const generateAIQuestion = async (params: {
  assessment_id: string;
  type: string;
  difficulty: number;
  competencies?: Array<{ id: string; name: string }>;
  job_title?: string;
  context?: string;
  order?: number;
  weightage?: number;
}): Promise<{ success: boolean; question: QuestionResource }> => {
  const { data } = await axiosInstance.post('/admin/questions/generate_ai/', params);
  return data;
};

/**
 * Generate multiple questions using AI
 */
export const generateAIQuestionsBulk = async (params: {
  assessment_id: string;
  type_counts: Record<string, number>;
  difficulty: number;
  competencies?: Array<{ id: string; name: string }>;
  job_title?: string;
}): Promise<{
  success: boolean;
  created: number;
  questions: QuestionResource[];
  errors: any[];
}> => {
  const { data } = await axiosInstance.post('/admin/questions/generate_ai_bulk/', params);
  return data;
};

// =====================================================
// Question Template (Bank) APIs
// =====================================================

/**
 * Get question templates with filters
 */
export const getQuestionTemplates = async (params?: {
  type?: string;
  difficulty?: number;
  competency?: string;
  job_title?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<QuestionTemplateResource>> => {
  const { data } = await axiosInstance.get('/admin/questions/templates/', { params });
  return normalizePaginated(data, params?.page || 1, params?.page_size || 20);
};

/**
 * Recommend questions from template bank
 */
export const recommendQuestions = async (params: {
  type?: string;
  difficulty?: number;
  competency_id?: string;
  job_title_id?: string;
  exclude_ids?: string[];
  limit?: number;
}): Promise<{ count: number; results: QuestionTemplateResource[] }> => {
  const { data } = await axiosInstance.post('/admin/questions/templates/recommend/', params);
  return data;
};

/**
 * Recommend questions in bulk by type counts
 */
export const recommendQuestionsBulk = async (params: {
  type_counts: Record<string, number>;
  difficulty?: number;
  competency_id?: string;
  job_title_id?: string;
  exclude_ids?: string[];
}): Promise<{
  total_count: number;
  by_type: Record<string, QuestionTemplateResource[]>;
  all: QuestionTemplateResource[];
}> => {
  const { data } = await axiosInstance.post('/admin/questions/templates/recommend_bulk/', params);
  return data;
};

/**
 * Add a template to an assessment
 */
export const addTemplateToAssessment = async (
  templateId: string,
  assessmentId: string,
  options?: { order?: number; weightage?: number }
): Promise<{ success: boolean; question: QuestionResource }> => {
  const { data } = await axiosInstance.post(`/admin/questions/templates/${templateId}/add_to_assessment/`, {
    assessment_id: assessmentId,
    ...options,
  });
  return data;
};

/**
 * Add multiple templates to an assessment
 */
export const addTemplatesToAssessment = async (
  templateIds: string[],
  assessmentId: string
): Promise<{
  success: boolean;
  created: number;
  questions: QuestionResource[];
  errors: any[];
}> => {
  const { data } = await axiosInstance.post('/admin/questions/templates/bulk_add_to_assessment/', {
    assessment_id: assessmentId,
    template_ids: templateIds,
  });
  return data;
};
