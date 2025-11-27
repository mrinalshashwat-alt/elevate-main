import axios from 'axios';
import {
  JUDGE0_BASE_URL,
  JUDGE0_RAPIDAPI_KEY,
  JUDGE0_RAPIDAPI_HOST,
  JUDGE0_AUTH_TOKEN,
  JUDGE0_POLL_MAX_RETRIES,
  JUDGE0_POLL_DELAY_MS,
  DEFAULT_CPU_TIME_LIMIT,
  DEFAULT_MEMORY_LIMIT,
} from './config.js';

// Language mapping copied from frontend for consistency
export const JUDGE0_LANGUAGES = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  csharp: 51,
  ruby: 72,
  php: 68,
  rust: 73,
  swift: 83,
  kotlin: 78,
  scala: 81,
  typescript: 74,
  r: 80,
  perl: 85,
  haskell: 61,
  lua: 64,
  bash: 46,
};

export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (JUDGE0_RAPIDAPI_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_RAPIDAPI_KEY;
    headers['X-RapidAPI-Host'] = JUDGE0_RAPIDAPI_HOST;
  }

  if (JUDGE0_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${JUDGE0_AUTH_TOKEN}`;
  }

  return headers;
};

export const submitToJudge0 = async ({
  source_code,
  language_id,
  stdin = '',
  cpu_time_limit = DEFAULT_CPU_TIME_LIMIT,
  memory_limit = DEFAULT_MEMORY_LIMIT,
}) => {
  const url = `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`;

  const response = await axios.post(
    url,
    {
      source_code,
      language_id,
      stdin,
      cpu_time_limit,
      memory_limit,
    },
    {
      headers: getHeaders(),
    }
  );

  return response.data.token;
};

export const getJudge0Result = async (token) => {
  const url = `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`;

  const response = await axios.get(url, {
    headers: getHeaders(),
  });

  return response.data;
};

export const pollJudge0Result = async (
  token,
  maxRetries = JUDGE0_POLL_MAX_RETRIES,
  retryDelay = JUDGE0_POLL_DELAY_MS
) => {
  for (let i = 0; i < maxRetries; i++) {
    const result = await getJudge0Result(token);

    if (
      result.status.id !== JUDGE0_STATUS.IN_QUEUE &&
      result.status.id !== JUDGE0_STATUS.PROCESSING
    ) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  // Final attempt after exhausting retries
  return getJudge0Result(token);
};

export const executeWithJudge0 = async ({
  language,
  code,
  input = '',
  cpuTimeLimit = DEFAULT_CPU_TIME_LIMIT,
  memoryLimit = DEFAULT_MEMORY_LIMIT,
  maxRetries,
  retryDelay,
}) => {
  const startTime = Date.now();

  try {
    const languageId = JUDGE0_LANGUAGES[language.toLowerCase()];
    if (!languageId) {
      throw new Error(
        `Unsupported language: ${language}. Supported languages: ${Object.keys(
          JUDGE0_LANGUAGES
        ).join(', ')}`
      );
    }

    const token = await submitToJudge0({
      source_code: code,
      language_id: languageId,
      stdin: input,
      cpu_time_limit: cpuTimeLimit,
      memory_limit: memoryLimit,
    });

    const result = await pollJudge0Result(
      token,
      maxRetries,
      retryDelay
    );

    const executionTime = Date.now() - startTime;
    const statusId = result.status.id;
    let success = false;
    let output = '';
    let error = null;
    const statusDescription = result.status.description || 'Unknown';

    if (statusId === JUDGE0_STATUS.ACCEPTED) {
      success = true;
      output = (result.stdout || result.output || '').trim();
    } else if (statusId === JUDGE0_STATUS.COMPILATION_ERROR) {
      error = `Compilation Error: ${
        result.compile_output || result.stderr || statusDescription
      }`;
    } else if (
      statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV ||
      statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGXFSZ ||
      statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGFPE ||
      statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGABRT ||
      statusId === JUDGE0_STATUS.RUNTIME_ERROR_NZEC ||
      statusId === JUDGE0_STATUS.RUNTIME_ERROR_OTHER
    ) {
      error = `Runtime Error: ${
        result.stderr || result.message || statusDescription
      }`;
    } else if (statusId === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED) {
      error = 'Time Limit Exceeded';
    } else if (statusId === JUDGE0_STATUS.WRONG_ANSWER) {
      error = 'Wrong Answer';
      output = (result.stdout || result.output || '').trim();
    } else if (statusId === JUDGE0_STATUS.INTERNAL_ERROR) {
      error = `Internal Error: ${result.message || statusDescription}`;
    } else {
      error = `Execution Error: ${result.message || statusDescription}`;
      output = result.stdout || result.output || '';
    }

    return {
      success,
      output: output.trim(),
      error: error ? error.trim() : null,
      executionTime,
      judge0Result: result,
      status: statusDescription,
      time: result.time || null,
      memory: result.memory || null,
    };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err.message || 'Unknown error occurred',
      executionTime: Date.now() - startTime,
    };
  }
};


