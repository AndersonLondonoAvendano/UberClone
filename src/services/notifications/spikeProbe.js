// AI-assisted: see docs/AI_LOG.md #64
// TEMPORARY (spike S1, T-169): asks for the permission, gets the token and subscribes to refreshes.
// Only runs with __DEV__ and logs ONLY the masked token. Remove after the spike gate.
import { logTokenInDev } from './safeLog';

// Returns an unsubscribe function. Never throws: any failure is swallowed so startup cannot break.
export async function runSpikeProbe({ notifications, isDev, log }) {
  if (isDev !== true) return () => {};
  let unsubscribe = () => {};
  try {
    const permission = await notifications.requestPermission();
    if (typeof log === 'function') log(`[spike] notification permission: ${permission}`);
    const token = await notifications.getToken();
    logTokenInDev('[spike] fcm token', token, { isDev, log });
    unsubscribe = notifications.onTokenRefresh((next) =>
      logTokenInDev('[spike] fcm token refreshed', next, { isDev, log }),
    );
  } catch (error) {
    if (typeof log === 'function') log(`[spike] failed: ${error?.code ?? error?.name ?? 'error'}`);
  }
  return typeof unsubscribe === 'function' ? unsubscribe : () => {};
}
