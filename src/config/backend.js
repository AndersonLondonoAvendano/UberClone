// AI-assisted: see docs/AI_LOG.md #55
// Backend (payments) settings. The base URL is public configuration (EXPO_PUBLIC_*); no secret lives
// in the app. When it is not set the payments service answers NOT_CONFIGURED.

export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

// Maximum wait for one backend request before it is aborted.
export const BACKEND_TIMEOUT_MS = 15000;
