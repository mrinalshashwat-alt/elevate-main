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
  job_title_name?: string;
  status?: string;
  job_type?: string;
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
  assessment_count?: number;
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

const toJob = (job: JobAdminResource): Job => ({
  id: job.id,
  title: job.title,
  company: job.job_title_name || 'Unspecified',
  location: formatLocation(job),
  type: mapJobType(job.job_type),
  salary: formatSalary(job),
  postedAt: job.published_at || job.created_at || new Date().toISOString(),
  status: mapJobStatus(job.status),
  competencies: job.assessment_count !== undefined ? [`Assessments linked: ${job.assessment_count}`] : [],
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
