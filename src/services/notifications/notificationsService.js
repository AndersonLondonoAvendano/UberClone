// AI-assisted: see AI_LOG.md #64
// Wires the notifications client to the real fetch, the backend URL and the Firebase Auth ID token of
// the signed-in driver (T-181). The push token and the ID token never leave through logs.

import { BACKEND_TIMEOUT_MS, BACKEND_URL } from '../../config/backend';
import { auth } from '../firebase';
import { createNotificationsApi } from './notificationsApi';
import { logPushEvent } from './safeLog';

export const notificationsApi = createNotificationsApi({
  fetchFn: (...args) => fetch(...args),
  getToken: async () => (auth.currentUser ? auth.currentUser.getIdToken() : null),
  baseUrl: BACKEND_URL,
  timeoutMs: BACKEND_TIMEOUT_MS,
});

// AI-assisted: see AI_LOG.md #72
// Result trace of the availability reports (D-199): a fixed code only, and nothing at all outside __DEV__.
export const traceAvailability = (code) => logPushEvent(code, { isDev: __DEV__, log: (message) => console.log(message) });
