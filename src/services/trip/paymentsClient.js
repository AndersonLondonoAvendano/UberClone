// AI-assisted: see docs/AI_LOG.md #55
// Pure client of the backend payments endpoints (T-95, RF-42, RF-43). fetch, the token getter, the
// base URL and the timeout are injected, so a script can test it without network or Firebase.
// It never throws: every result is { ok: true, ... } or { ok: false, error }.

export const PAYMENTS_ERROR = {
  OFFLINE: 'offline',
  BACKEND_UNAVAILABLE: 'backendUnavailable',
  FAILED: 'failed',
};

const fail = (error) => ({ ok: false, error });

export function createPaymentsClient({ fetchFn, getToken, baseUrl, timeoutMs = 15000 }) {
  async function post(path, tripId) {
    if (!baseUrl) return fail(PAYMENTS_ERROR.BACKEND_UNAVAILABLE);
    let token;
    try {
      token = await getToken();
    } catch {
      return fail(PAYMENTS_ERROR.FAILED);
    }
    if (!token) return fail(PAYMENTS_ERROR.FAILED);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchFn(`${baseUrl.replace(/\/+$/, '')}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tripId }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timer);
      // An aborted request is a slow backend; any other fetch rejection means no network.
      return fail(error?.name === 'AbortError' ? PAYMENTS_ERROR.BACKEND_UNAVAILABLE : PAYMENTS_ERROR.OFFLINE);
    }
    clearTimeout(timer);

    if (response.status >= 500 || response.status === 429) return fail(PAYMENTS_ERROR.BACKEND_UNAVAILABLE);
    if (!response.ok) return fail(PAYMENTS_ERROR.FAILED);
    try {
      return { ok: true, data: await response.json() };
    } catch {
      return fail(PAYMENTS_ERROR.FAILED);
    }
  }

  return {
    // Resolves { ok: true, url } with an https checkout url.
    async requestCheckoutUrl(tripId) {
      const result = await post('/payments/checkout', tripId);
      if (!result.ok) return result;
      const url = result.data?.url;
      if (typeof url !== 'string' || !url.startsWith('https://')) return fail(PAYMENTS_ERROR.FAILED);
      return { ok: true, url };
    },
    // Resolves { ok: true, paymentStatus } with what the backend wrote.
    async syncPayment(tripId) {
      const result = await post('/payments/sync', tripId);
      if (!result.ok) return result;
      const paymentStatus = result.data?.paymentStatus;
      if (typeof paymentStatus !== 'string') return fail(PAYMENTS_ERROR.FAILED);
      return { ok: true, paymentStatus };
    },
  };
}
