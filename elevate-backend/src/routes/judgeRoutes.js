import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  MAX_SUBMISSIONS_PER_MINUTE,
  MAX_SUBMISSIONS_PER_HOUR,
  DEFAULT_CPU_TIME_LIMIT,
  DEFAULT_MEMORY_LIMIT,
  JUDGE0_POLL_MAX_RETRIES,
  JUDGE0_POLL_DELAY_MS,
} from '../config.js';
import { createSubmission, getSubmission } from '../judgeQueue.js';
import { executeWithJudge0 } from '../judge0Client.js';

const router = express.Router();

// Basic rate limiters
const perMinuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: MAX_SUBMISSIONS_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Too many submissions, please try again in a minute.',
  },
});

const perHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: MAX_SUBMISSIONS_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Too many submissions this hour, please slow down.',
  },
});

// Apply rate limiting to all judge routes
router.use(perMinuteLimiter);
router.use(perHourLimiter);

// Health check for this router
router.get('/health', (req, res) => {
  res.json({ ok: true });
});

// POST /api/judge/submit
router.post('/submit', async (req, res) => {
  try {
    const {
      language,
      sourceCode,
      stdin = '',
      cpuTimeLimit = DEFAULT_CPU_TIME_LIMIT,
      memoryLimit = DEFAULT_MEMORY_LIMIT,
      maxRetries = JUDGE0_POLL_MAX_RETRIES,
      retryDelay = JUDGE0_POLL_DELAY_MS,
      metadata = {},
    } = req.body || {};

    if (!language || !sourceCode) {
      return res.status(400).json({
        error: true,
        message: 'language and sourceCode are required',
      });
    }

    const submission = createSubmission({
      language,
      sourceCode,
      stdin,
      cpuTimeLimit,
      memoryLimit,
      maxRetries,
      retryDelay,
      metadata,
    });

    res.status(202).json({
      error: false,
      submissionId: submission.id,
      status: submission.status,
    });
  } catch (err) {
    console.error('Error in /api/judge/submit:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to create submission',
    });
  }
});

// GET /api/judge/result/:submissionId
router.get('/result/:submissionId', (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = getSubmission(submissionId);

    if (!submission) {
      return res.status(404).json({
        error: true,
        message: 'Submission not found',
      });
    }

    res.json({
      error: false,
      submissionId: submission.id,
      status: submission.status,
      result: submission.result,
      metadata: submission.metadata,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    });
  } catch (err) {
    console.error('Error in /api/judge/result:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch submission result',
    });
  }
});

// POST /api/judge/execute - synchronous helper
router.post('/execute', async (req, res) => {
  try {
    const {
      language,
      sourceCode,
      stdin = '',
      cpuTimeLimit = DEFAULT_CPU_TIME_LIMIT,
      memoryLimit = DEFAULT_MEMORY_LIMIT,
      maxRetries = JUDGE0_POLL_MAX_RETRIES,
      retryDelay = JUDGE0_POLL_DELAY_MS,
      metadata = {},
    } = req.body || {};

    if (!language || !sourceCode) {
      return res.status(400).json({
        error: true,
        message: 'language and sourceCode are required',
      });
    }

    const result = await executeWithJudge0({
      language,
      code: sourceCode,
      input: stdin,
      cpuTimeLimit,
      memoryLimit,
      maxRetries,
      retryDelay,
      metadata,
    });

    res.json({
      error: false,
      result,
    });
  } catch (err) {
    console.error('Error in /api/judge/execute:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to execute code',
    });
  }
});

export default router;


