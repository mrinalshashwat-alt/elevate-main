/**
 * Judge0 API Integration
 * Provides code execution and evaluation using Judge0 API
 * Supports multiple programming languages
 */

import { RAPIDAPI_KEY, RAPIDAPI_URL, USE_HARDCODED_CONFIG } from './judge0Config';

// Judge0 Language IDs mapping
export const JUDGE0_LANGUAGES = {
  javascript: 63,      // Node.js
  python: 71,          // Python 3
  java: 62,            // Java
  cpp: 54,             // C++17
  c: 50,               // C
  go: 60,              // Go
  csharp: 51,          // C#
  ruby: 72,            // Ruby
  php: 68,             // PHP
  rust: 73,            // Rust
  swift: 83,           // Swift
  kotlin: 78,          // Kotlin
  scala: 81,           // Scala
  typescript: 74,      // TypeScript
  r: 80,               // R
  perl: 85,            // Perl
  haskell: 61,         // Haskell
  lua: 64,             // Lua
  bash: 46,            // Bash
};

// Judge0 Status IDs
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

const USE_BACKEND_FOR_JUDGE0 =
  process.env.NEXT_PUBLIC_USE_BACKEND_FOR_JUDGE0 === 'true';

const getBackendBaseURL = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
};

/**
 * Get Judge0 API base URL from environment or use default
 */
const getJudge0BaseURL = () => {
  // For testing: use hardcoded config if enabled
  if (USE_HARDCODED_CONFIG && RAPIDAPI_URL) {
    return RAPIDAPI_URL;
  }
  
  // Try environment variable first
  if (process.env.NEXT_PUBLIC_JUDGE0_API_URL) {
    return process.env.NEXT_PUBLIC_JUDGE0_API_URL;
  }
  
  // Default to RapidAPI Judge0 endpoint (requires API key)
  // For self-hosted: use your own Judge0 instance URL
  // Example: 'https://judge0-ce.p.rapidapi.com' (RapidAPI)
  // Example: 'http://localhost:2358' (self-hosted)
  return process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_URL || 'https://judge0-ce.p.rapidapi.com';
};

/**
 * Get Judge0 API headers
 */
const getJudge0Headers = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // For testing: use hardcoded config if enabled
  if (USE_HARDCODED_CONFIG && RAPIDAPI_KEY && RAPIDAPI_KEY !== 'YOUR_RAPIDAPI_KEY_HERE') {
    headers['X-RapidAPI-Key'] = RAPIDAPI_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    return headers;
  }

  // Add RapidAPI headers if using RapidAPI (from environment)
  if (process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY) {
    headers['X-RapidAPI-Key'] = process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }

  // For self-hosted Judge0, you might need authentication
  if (process.env.NEXT_PUBLIC_JUDGE0_AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_JUDGE0_AUTH_TOKEN}`;
  }

  return headers;
};

/**
 * Submit code to Judge0 for execution
 * @param {string} sourceCode - The source code to execute
 * @param {number} languageId - Judge0 language ID
 * @param {string} stdin - Standard input (optional)
 * @param {number} cpuTimeLimit - CPU time limit in seconds (default: 5)
 * @param {number} memoryLimit - Memory limit in KB (default: 128000)
 * @returns {Promise<string>} Submission token
 */
export const submitToJudge0 = async (
  sourceCode,
  languageId,
  stdin = '',
  cpuTimeLimit = 5,
  memoryLimit = 128000
) => {
  try {
    const baseURL = getJudge0BaseURL();
    const response = await fetch(`${baseURL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: getJudge0Headers(),
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin,
        cpu_time_limit: cpuTimeLimit,
        memory_limit: memoryLimit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error submitting to Judge0:', error);
    throw error;
  }
};

/**
 * Get submission result from Judge0
 * @param {string} token - Submission token
 * @returns {Promise<Object>} Submission result
 */
export const getJudge0Result = async (token) => {
  try {
    const baseURL = getJudge0BaseURL();
    const response = await fetch(`${baseURL}/submissions/${token}?base64_encoded=false`, {
      method: 'GET',
      headers: getJudge0Headers(),
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Judge0 result:', error);
    throw error;
  }
};

/**
 * Poll for submission result (with retry logic)
 * @param {string} token - Submission token
 * @param {number} maxRetries - Maximum number of retries (default: 30)
 * @param {number} retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} Final submission result
 */
export const pollJudge0Result = async (token, maxRetries = 30, retryDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    const result = await getJudge0Result(token);
    
    // Check if result is ready (status ID 1 and 2 mean still processing)
    if (result.status.id !== JUDGE0_STATUS.IN_QUEUE && 
        result.status.id !== JUDGE0_STATUS.PROCESSING) {
      return result;
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  
  // If we've exhausted retries, get the final result anyway
  return await getJudge0Result(token);
};

/**
 * Execute code using Judge0
 * @param {string} language - Language name (e.g., 'python', 'java')
 * @param {string} code - Source code
 * @param {string} input - Standard input
 * @param {Object} options - Additional options (cpuTimeLimit, memoryLimit)
 * @returns {Promise<Object>} Execution result
 */
const executeWithJudge0Direct = async (language, code, input = '', options = {}) => {
  const startTime = Date.now();
  
  try {
    // Get language ID
    const languageId = JUDGE0_LANGUAGES[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}. Supported languages: ${Object.keys(JUDGE0_LANGUAGES).join(', ')}`);
    }

    // Submit code
    const token = await submitToJudge0(
      code,
      languageId,
      input,
      options.cpuTimeLimit || 5,
      options.memoryLimit || 128000
    );

    // Poll for result
    const result = await pollJudge0Result(token, options.maxRetries || 30, options.retryDelay || 1000);

    // Format result
    const executionTime = Date.now() - startTime;
    const statusId = result.status.id;
    
    let success = false;
    let output = '';
    let error = null;
    let statusDescription = result.status.description || 'Unknown';

    if (statusId === JUDGE0_STATUS.ACCEPTED) {
      success = true;
      // Get output from stdout or output field, clean it up
      output = (result.stdout || result.output || '').trim();
    } else if (statusId === JUDGE0_STATUS.COMPILATION_ERROR) {
      error = `Compilation Error: ${result.compile_output || result.stderr || statusDescription}`;
    } else if (statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV ||
               statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGXFSZ ||
               statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGFPE ||
               statusId === JUDGE0_STATUS.RUNTIME_ERROR_SIGABRT ||
               statusId === JUDGE0_STATUS.RUNTIME_ERROR_NZEC ||
               statusId === JUDGE0_STATUS.RUNTIME_ERROR_OTHER) {
      error = `Runtime Error: ${result.stderr || result.message || statusDescription}`;
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
      judge0Result: result, // Include full result for debugging
      status: statusDescription,
      time: result.time || null,
      memory: result.memory || null,
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error.message || 'Unknown error occurred',
      executionTime: Date.now() - startTime,
    };
  }
};

const executeWithBackend = async (language, code, input = '', options = {}) => {
  const startTime = Date.now();
  try {
    const backendURL = getBackendBaseURL();
    const response = await fetch(`${backendURL}/api/judge/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        sourceCode: code,
        stdin: input,
        cpuTimeLimit: options.cpuTimeLimit || 5,
        memoryLimit: options.memoryLimit || 128000,
        maxRetries: options.maxRetries || 30,
        retryDelay: options.retryDelay || 1000,
        metadata: options.metadata || {},
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Backend Judge0 execute error: ${response.status} - ${text}`
      );
    }

    const data = await response.json();
    if (data && data.result) {
      return data.result;
    }

    // Fallback in case shape is different
    return {
      success: false,
      output: '',
      error: 'Invalid response from backend Judge0 service',
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error.message || 'Unknown error occurred',
      executionTime: Date.now() - startTime,
    };
  }
};

/**
 * Execute code using Judge0, optionally via backend
 */
export const executeWithJudge0 = async (language, code, input = '', options = {}) => {
  if (USE_BACKEND_FOR_JUDGE0 && process.env.NEXT_PUBLIC_BACKEND_URL) {
    return executeWithBackend(language, code, input, options);
  }
  return executeWithJudge0Direct(language, code, input, options);
};

/**
 * Check if Judge0 is available/configured
 * @returns {boolean}
 */
export const isJudge0Available = () => {
  if (USE_BACKEND_FOR_JUDGE0 && process.env.NEXT_PUBLIC_BACKEND_URL) {
    return true;
  }
  // Check hardcoded config first (for testing)
  if (USE_HARDCODED_CONFIG && RAPIDAPI_KEY && RAPIDAPI_KEY !== 'YOUR_RAPIDAPI_KEY_HERE') {
    return true;
  }
  
  // Check environment variables
  return !!(
    process.env.NEXT_PUBLIC_JUDGE0_API_URL ||
    process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_URL ||
    process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY
  );
};

/**
 * Get supported languages
 * @returns {Array<string>} List of supported language names
 */
export const getSupportedLanguages = () => {
  return Object.keys(JUDGE0_LANGUAGES);
};

