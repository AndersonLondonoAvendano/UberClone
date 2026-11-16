// AI-assisted: see docs/AI_LOG.md #64
// Pure client of the backend notification endpoints (T-181, DP-70, RF-72, RF-81). fetch, the ID-token
// getter, the base URL and the timeout are injected (same pattern as paymentsClient), so a script can
// test it without network or Firebase. It never throws: every result is { ok: true, ... } or
// { ok: false, error }. It never sends the uid (the backend takes it from the ID token) and never
// logs or returns bodies, headers or the push token.

export const NOTIFICATIONS_ERROR = {
  OFFLINE: 'offline', // no backend URL, no network, or the request timed out
  RATE_LIMITED: 'rate-limited', // HTTP 429
  NO_DEVICES: 'no-devices', // HTTP 404: the backend has no registered device for this driver
  SESSION: 'session', // no ID token, getToken failed, HTTP 401 or 403
  SERVER: 'server', // 5xx and any other failure
};

const fail = (error) => ({ ok: false, error });

export function createNotificationsApi({ fetchFn, getToken, baseUrl, timeoutMs = 15000 }) {
  async function post(path, body) {
    if (typeof baseUrl !== 'string' || !baseUrl.trim()) return fail(NOTIFICATIONS_ERROR.OFFLINE);
    let idToken;
    try {
      idToken = await getToken();
    } catch {
      return fail(NOTIFICATIONS_ERROR.SESSION);
    }
    if (!idToken) return fail(NOTIFICATIONS_ERROR.SESSION);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchFn(`${baseUrl.replace(/\/+$/, '')}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timer);
      return fail(NOTIFICATIONS_ERROR.OFFLINE);
    }
    clearTimeout(timer);

    const status = response?.status;
    if (status === 401 || status === 403) return fail(NOTIFICATIONS_ERROR.SESSION);
    if (status === 404) return fail(NOTIFICATIONS_ERROR.NO_DEVICES);
    if (status === 429) return fail(NOTIFICATIONS_ERROR.RATE_LIMITED);
    if (!response?.ok) return fail(NOTIFICATIONS_ERROR.SERVER);
    return { ok: true };
  }

  return {
    registerToken(token) {
      if (typeof token !== 'string' || token.length === 0) return Promise.resolve(fail(NOTIFICATIONS_ERROR.SERVER));
      return post('/notifications/register', { token, platform: 'android' });
    },
    unregisterToken(token) {
      if (typeof token !== 'string' || token.length === 0) return Promise.resolve(fail(NOTIFICATIONS_ERROR.SERVER));
      return post('/notifications/unregister', { token });
    },
    // Asks the backend to send the simulated request to this driver's devices (optionally delayed).
    requestTestNotification({ delaySeconds } = {}) {
      return post('/notifications/test-request', delaySeconds === undefined ? {} : { delaySeconds });
    },
  };
}
