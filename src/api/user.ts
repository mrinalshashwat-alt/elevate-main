import axiosInstance from './axiosInstance';
import { DashboardStats, Course, MockInterview, PaginatedResponse } from '../types';

type DrfListResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T[];
};

type AssessmentPublic = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  duration_minutes: number;
  total_questions?: number;
  time_remaining?: number;
};

type AssessmentDetail = AssessmentPublic & {
  settings?: Record<string, unknown>;
};

type JobPublic = {
  id: string;
  title: string;
  job_title_name?: string;
  description?: string;
  min_experience_years?: number | string;
  job_type?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  salary_currency?: string;
  published_at?: string;
  created_at?: string;
};

type StartAssessmentPayload = {
  assessmentId: string;
  name: string;
  email: string;
  phone?: string;
};

type AttemptStartResponse = {
  attempt_id: string;
  assessment: AssessmentDetail & { settings?: Record<string, unknown> };
  expires_at?: string | null;
  time_remaining_seconds?: number;
  questions?: Array<{
    id: string;
    type: string;
    order: number;
    content: Record<string, unknown>;
  }>;
};

const unwrapList = <T>(payload: DrfListResponse<T> | T[] | undefined): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const buildLocation = (job: JobPublic): string => {
  const parts = [job.location_city, job.location_state, job.location_country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Remote';
};

const toCourse = (assessment: AssessmentPublic): Course => ({
  id: assessment.id,
  title: assessment.name,
  description: assessment.description || 'No description provided yet.',
  duration: assessment.duration_minutes ? `${assessment.duration_minutes} min` : 'Self-paced',
  progress: assessment.time_remaining && assessment.time_remaining <= 0 ? 100 : 0,
  thumbnail: '/img.png',
});

const fetchAssessments = async (): Promise<AssessmentPublic[]> => {
  const { data } = await axiosInstance.get<DrfListResponse<AssessmentPublic>>('/assessment/');
  return unwrapList<AssessmentPublic>(data);
};

const fetchJobs = async (): Promise<JobPublic[]> => {
  const { data } = await axiosInstance.get<DrfListResponse<JobPublic>>('/jobs/');
  return unwrapList<JobPublic>(data);
};

export const getUserDashboard = async (): Promise<DashboardStats> => {
  const [assessments, jobs] = await Promise.all([fetchAssessments(), fetchJobs()]);

  const completedAssessments = assessments.filter((assessment) => (assessment.time_remaining ?? 0) <= 0).length;

  return {
    totalCourses: assessments.length,
    completedCourses: completedAssessments,
    upcomingInterviews: jobs.length,
    skillScore:
      assessments.length > 0
        ? Math.min(100, Math.round((completedAssessments / assessments.length) * 100))
        : 0,
  };
};

export const getUserCourses = async (): Promise<Course[]> => {
  const assessments = await fetchAssessments();
  return assessments.map(toCourse);
};

export const getCourseContent = async (courseId: string): Promise<any> => {
  if (!courseId) {
    throw new Error('courseId is required to load course content.');
  }

  const { data } = await axiosInstance.get<AssessmentDetail>(`/assessment/${courseId}/`);

  const moduleCount = Math.max(1, Math.min(6, data.total_questions || 1));
  const modules = Array.from({ length: moduleCount }).map((_, index) => ({
    id: `${data.id}-module-${index + 1}`,
    title: `Module ${index + 1}`,
    duration: data.duration_minutes
      ? `${Math.max(10, Math.round(data.duration_minutes / moduleCount))} min`
      : 'Self-paced',
    completed: index === 0,
  }));

  return {
    id: data.id,
    title: data.name,
    description: data.description,
    instructions: data.instructions,
    duration_minutes: data.duration_minutes,
    modules,
  };
};

export const getMockInterviews = async (): Promise<MockInterview[]> => {
  const jobs = await fetchJobs();

  return jobs.slice(0, 10).map((job) => ({
    id: job.id,
    title: job.title,
    type: job.job_type?.replace('_', ' ') || 'Interview',
    duration: job.min_experience_years ? `${job.min_experience_years}+ yrs experience` : '60 min',
    difficulty: 'medium',
    scheduledAt: job.published_at || job.created_at || new Date().toISOString(),
  }));
};

export const scheduleMockInterview = async (data: Partial<StartAssessmentPayload>): Promise<MockInterview> => {
  if (!data?.assessmentId || !data?.name || !data?.email) {
    throw new Error('assessmentId, name, and email are required to schedule an interview.');
  }

  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone || '',
  };

  const response = await axiosInstance.post<AttemptStartResponse>(
    `/assessment/${data.assessmentId}/start/`,
    payload
  );

  return {
    id: response.data.attempt_id,
    title: response.data.assessment?.name || 'Assessment Attempt',
    type: 'technical',
    duration: response.data.assessment?.duration_minutes
      ? `${response.data.assessment.duration_minutes} min`
      : '60 min',
    difficulty: 'medium',
    scheduledAt: new Date().toISOString(),
  };
};

export const getAIAgents = async (): Promise<any[]> => {
  const jobs = await fetchJobs();

  return jobs.slice(0, 6).map((job, index) => ({
    id: `${job.id}-agent`,
    name: job.title,
    description: job.description || 'AI agent powered by real assessment data.',
    icon: ['💬', '🤖', '🎯', '⚙️', '🧠', '📈'][index % 6],
    available: true,
  }));
};

export const submitTest = async (testId: string, answers: Record<string, unknown>): Promise<any> => {
  if (!testId) {
    throw new Error('testId is required to submit a test.');
  }

  // Placeholder until attempt APIs are fully wired to the UI.
  return {
    id: testId,
    answers,
    submittedAt: new Date().toISOString(),
    score: 0,
    passed: false,
    feedback:
      'Submission recorded locally. Wire this flow to Attempt APIs once assessment-taking UI is ready.',
  };
};
