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

// Own timeout of the availability report: shorter than MOCK_EMIT_MIN_MS so a slow answer never delays the mock fallback.
export const AVAILABILITY_TIMEOUT_MS = 5000;

export function createNotificationsApi({ fetchFn, getToken, baseUrl, timeoutMs = 15000 }) {
  // options.timeoutMs overrides the default; options.readJson makes a success carry the parsed body.
  async function post(path, body, options = {}) {
    if (typeof baseUrl !== 'string' || !baseUrl.trim()) return fail(NOTIFICATIONS_ERROR.OFFLINE);
    let idToken;
    try {
      idToken = await getToken();
    } catch {
      return fail(NOTIFICATIONS_ERROR.SESSION);
    }
    if (!idToken) return fail(NOTIFICATIONS_ERROR.SESSION);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? timeoutMs);
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
    if (options.readJson) {
      try {
        const json = await response.json();
        if (typeof json?.active !== 'boolean') return fail(NOTIFICATIONS_ERROR.SERVER);
        const result = { ok: true, active: json.active };
        // D-199: `applied` and `lastSeq` only when they have the right type; an old backend omits both.
        if (typeof json.applied === 'boolean') result.applied = json.applied;
        if (Number.isSafeInteger(json.lastSeq)) result.lastSeq = json.lastSeq;
        return result;
      } catch {
        return fail(NOTIFICATIONS_ERROR.SERVER);
      }
    }
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
    // Tells the backend whether the driver is available. The body is only { available } or { available, seq }
    // (seq only when it is a safe integer > 0): no location, no uid, no personal data. Resolves
    // { ok: true, active[, applied][, lastSeq] } (server generator running; applied:false means the backend
    // ignored an obsolete seq and lastSeq is the last one it accepted) or { ok: false, error }.
    // AI-assisted: see docs/AI_LOG.md #70
    // AI-assisted: see docs/AI_LOG.md #72
    reportAvailability(available, seq) {
      if (typeof available !== 'boolean') return Promise.resolve(fail(NOTIFICATIONS_ERROR.SERVER));
      const body = Number.isSafeInteger(seq) && seq > 0 ? { available, seq } : { available };
      return post('/notifications/availability', body, { timeoutMs: AVAILABILITY_TIMEOUT_MS, readJson: true });
    },
  };
}
