// AI-assisted: see docs/AI_LOG.md #64
// Wires the notifications client to the real fetch, the backend URL and the Firebase Auth ID token of
// the signed-in driver (T-181). The push token and the ID token never leave through logs.

import { BACKEND_TIMEOUT_MS, BACKEND_URL } from '../../config/backend';
import { auth } from '../firebase';
import { createNotificationsApi } from './notificationsApi';

export const notificationsApi = createNotificationsApi({
  fetchFn: (...args) => fetch(...args),
  getToken: async () => (auth.currentUser ? auth.currentUser.getIdToken() : null),
  baseUrl: BACKEND_URL,
  timeoutMs: BACKEND_TIMEOUT_MS,
});
