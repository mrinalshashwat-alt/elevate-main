/**
 * Candidate API - Assessment taking endpoints
 */
import axiosInstance from './axiosInstance';

interface JoinAssessmentResponse {
  assessment: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    duration_minutes: number;
    settings: any;
  };
  message: string;
}

interface StartAssessmentPayload {
  email: string;
  name: string;
  phone?: string;
}

interface StartAssessmentResponse {
  attempt_id: string;
  expires_at: string;
  time_remaining_seconds: number;
  can_resume: boolean;
  assessment: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    duration_minutes: number;
    total_questions: number;
    settings: any;
  };
  questions: Array<{
    id: string;
    type: string;
    order: number;
    difficulty: string;
    scoring: any;
    content: any;
  }>;
  existing_responses?: Array<{
    question_id: string;
    answer: any;
    time_spent_seconds: number;
  }>;
}

interface SaveResponsePayload {
  question_id: string;
  answer: any;
}

interface SubmitAttemptResponse {
  submitted: boolean;
  finished_at: string;
  message: string;
}

interface HeartbeatResponse {
  status: 'active' | 'inactive' | 'invalidated';
  time_remaining_seconds: number;
  reason?: string;
}

interface ReportViolationPayload {
  type: string;  // e.g., "multiple_faces", "eye_tracking_away", "audio_detected"
  severity: 'low' | 'medium' | 'high';
  metadata?: any;
}

interface ExecuteCodePayload {
  question_id: string;
  code: string;
  language: string;
  test_case_index?: number;
}

interface GetResultsResponse {
  id: string;
  assessment_name: string;
  status: string;
  total_score: number;
  mcq_score: number;
  code_score: number;
  subjective_score: number;
  started_at: string;
  finished_at: string;
  total_questions: number;
  responses: any[];
  competency_scores: Array<{
    competency_name: string;
    competency_category: string;
    total_marks: number;
    marks_obtained: number;
    percentage: number;
    mcq_marks: number;
    coding_marks: number;
    subjective_marks: number;
  }>;
}

interface DashboardResponse {
  ongoing_attempts: any[];
  completed_attempts: any[];
  total_assessments: number;
}

/**
 * Join assessment using unique link token
 */
export const joinAssessmentByToken = async (token: string): Promise<JoinAssessmentResponse> => {
  const response = await axiosInstance.get(`/assessment/join/${token}/`);
  return response.data;
};

/**
 * Start assessment for participant
 */
export const startAssessment = async (
  assessmentId: string,
  data: StartAssessmentPayload
): Promise<StartAssessmentResponse> => {
  const response = await axiosInstance.post(`/assessment/${assessmentId}/start/`, data);
  return response.data;
};

/**
 * Save/update response for a question (auto-save)
 */
export const saveResponse = async (
  attemptId: string,
  data: SaveResponsePayload
): Promise<any> => {
  const response = await axiosInstance.post(`/attempts/${attemptId}/save/`, data);
  return response.data;
};

/**
 * Submit attempt (final submission)
 */
export const submitAttempt = async (attemptId: string): Promise<SubmitAttemptResponse> => {
  const response = await axiosInstance.post(`/attempts/${attemptId}/submit/`);
  return response.data;
};

/**
 * Send heartbeat to check status and get time remaining
 */
export const sendHeartbeat = async (attemptId: string): Promise<HeartbeatResponse> => {
  const response = await axiosInstance.post(`/attempts/${attemptId}/heartbeat/`);
  return response.data;
};

/**
 * Report proctoring violation (from MediaPipe, audio detection, etc.)
 */
export const reportViolation = async (
  attemptId: string,
  violation: ReportViolationPayload
): Promise<any> => {
  const response = await axiosInstance.post(`/attempts/${attemptId}/report_violation/`, violation);
  return response.data;
};

/**
 * Execute code for a coding question (Run button)
 */
export const executeCode = async (
  attemptId: string,
  data: ExecuteCodePayload
): Promise<any> => {
  const response = await axiosInstance.post(`/attempts/${attemptId}/execute_code/`, data);
  return response.data;
};

/**
 * Get code execution result
 */
export const getCodeResult = async (attemptId: string, jobId: string): Promise<any> => {
  const response = await axiosInstance.get(`/attempts/${attemptId}/code/result/${jobId}/`);
  return response.data;
};

/**
 * Get attempt results (after submission)
 */
export const getAttemptResults = async (attemptId: string): Promise<GetResultsResponse> => {
  const response = await axiosInstance.get(`/attempts/${attemptId}/results/`);
  return response.data;
};

/**
 * Get participant dashboard
 */
export const getParticipantDashboard = async (): Promise<DashboardResponse> => {
  const response = await axiosInstance.get('/participants/dashboard/');
  return response.data;
};

export default {
  joinAssessmentByToken,
  startAssessment,
  saveResponse,
  submitAttempt,
  sendHeartbeat,
  reportViolation,
  executeCode,
  getCodeResult,
  getAttemptResults,
  getParticipantDashboard,
};
