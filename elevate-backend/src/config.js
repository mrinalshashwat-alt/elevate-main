import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 4000;

export const JUDGE0_BASE_URL =
  process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';

export const JUDGE0_RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY || '';
export const JUDGE0_RAPIDAPI_HOST =
  process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';

export const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || '';

export const MAX_CONCURRENT_JUDGE0_REQUESTS = Number(
  process.env.MAX_CONCURRENT_JUDGE0_REQUESTS || 5
);

export const JUDGE0_POLL_MAX_RETRIES = Number(
  process.env.JUDGE0_POLL_MAX_RETRIES || 30
);

export const JUDGE0_POLL_DELAY_MS = Number(
  process.env.JUDGE0_POLL_DELAY_MS || 1000
);

export const DEFAULT_CPU_TIME_LIMIT = Number(
  process.env.CPU_TIME_LIMIT || 5
);

export const DEFAULT_MEMORY_LIMIT = Number(
  process.env.MEMORY_LIMIT || 128000
);

export const MAX_SUBMISSIONS_PER_MINUTE = Number(
  process.env.MAX_SUBMISSIONS_PER_MINUTE || 10
);

export const MAX_SUBMISSIONS_PER_HOUR = Number(
  process.env.MAX_SUBMISSIONS_PER_HOUR || 100
);


