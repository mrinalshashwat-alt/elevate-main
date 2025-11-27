import { v4 as uuidv4 } from 'uuid';
import {
  MAX_CONCURRENT_JUDGE0_REQUESTS,
  JUDGE0_POLL_MAX_RETRIES,
  JUDGE0_POLL_DELAY_MS,
  DEFAULT_CPU_TIME_LIMIT,
  DEFAULT_MEMORY_LIMIT,
} from './config.js';
import { executeWithJudge0 } from './judge0Client.js';

// In-memory store for submissions (can be replaced with DB later)
const submissions = new Map();
const queue = [];
let activeCount = 0;

export const createSubmission = ({
  language,
  sourceCode,
  stdin = '',
  cpuTimeLimit = DEFAULT_CPU_TIME_LIMIT,
  memoryLimit = DEFAULT_MEMORY_LIMIT,
  maxRetries = JUDGE0_POLL_MAX_RETRIES,
  retryDelay = JUDGE0_POLL_DELAY_MS,
  metadata = {},
}) => {
  const submissionId = uuidv4();

  const submission = {
    id: submissionId,
    language,
    sourceCode,
    stdin,
    cpuTimeLimit,
    memoryLimit,
    maxRetries,
    retryDelay,
    metadata,
    status: 'queued',
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  submissions.set(submissionId, submission);

  queue.push({ submissionId });
  processQueue();

  return submission;
};

export const getSubmission = (submissionId) => {
  return submissions.get(submissionId) || null;
};

const processQueue = async () => {
  if (activeCount >= MAX_CONCURRENT_JUDGE0_REQUESTS) {
    return;
  }

  const job = queue.shift();
  if (!job) {
    return;
  }

  const submission = submissions.get(job.submissionId);
  if (!submission) {
    // Move on to next job
    setImmediate(processQueue);
    return;
  }

  activeCount += 1;

  const updated = {
    ...submission,
    status: 'processing',
    updatedAt: new Date().toISOString(),
  };
  submissions.set(submission.id, updated);

  try {
    const result = await executeWithJudge0({
      language: submission.language,
      code: submission.sourceCode,
      input: submission.stdin,
      cpuTimeLimit: submission.cpuTimeLimit,
      memoryLimit: submission.memoryLimit,
      maxRetries: submission.maxRetries,
      retryDelay: submission.retryDelay,
    });

    const finalSubmission = {
      ...submissions.get(submission.id),
      status: result.success ? 'completed' : 'error',
      result,
      error: result.error || null,
      updatedAt: new Date().toISOString(),
    };

    submissions.set(submission.id, finalSubmission);
  } catch (err) {
    const failedSubmission = {
      ...submissions.get(submission.id),
      status: 'error',
      error: err.message || 'Unknown error occurred',
      updatedAt: new Date().toISOString(),
    };
    submissions.set(submission.id, failedSubmission);
  } finally {
    activeCount -= 1;
    setImmediate(processQueue);
  }
};


