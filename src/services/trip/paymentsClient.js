// AI-assisted: see docs/AI_LOG.md #55
// Pure client of the backend payments endpoints (T-95, RF-42, RF-43). fetch, the token getter, the
// base URL and the timeout are injected, so a script can test it without network or Firebase.
// It never throws: every result is { ok: true, ... } or { ok: false, error }.
//
// AI-assisted: see docs/AI_LOG.md #58
// T-144 (RF-62, DP-48): getProviders() reads which gateways the backend has configured (booleans only) and
// checkout/sync carry an optional `provider` in the body. Without it the body is the legacy { tripId }.
//
// AI-assisted: see docs/AI_LOG.md #57
// T-125 (RF-57): `error` is one of eight stable classes. It is only a class: never a URL, a token,
// a header or the raw message of the thrown error.

export const PAYMENTS_ERROR = {
  NOT_CONFIGURED: 'notConfigured', // no backend URL in the app
  NETWORK: 'offline', // fetch rejected: no network or the backend is off
  TIMEOUT: 'timeout', // the request was aborted after timeoutMs
  AUTH: 'sessionExpired', // no ID token, getToken failed, HTTP 401 or 403
  NOT_FOUND: 'notFound', // HTTP 404
  SERVER: 'serverError', // HTTP 5xx and 429
  INVALID_RESPONSE: 'invalidResponse', // 2xx with an unreadable body or an unexpected shape
  PROVIDER: 'providerError', // the backend reports the provider (Mercado Pago) failed, or another 4xx
  PROVIDER_NOT_CONFIGURED: 'providerNotConfigured', // HTTP 400 { error: 'provider_not_configured' } (#59)
};

// Backend body code when the chosen gateway has no credentials (backend/src/routes/payments.js).
const NOT_CONFIGURED_BODY_CODE = 'provider_not_configured';

// Backend body code for a failed call to Mercado Pago (backend/src/middleware.js ERRORS.upstream, HTTP 502).
const UPSTREAM_BODY_CODE = 'upstream_error';

// Classes where the service could not be reached or did not answer in time. Consumers that only
// distinguish "unavailable" from "failed" (paymentActions) group them with this predicate.
const UNREACHABLE = new Set([
  PAYMENTS_ERROR.NOT_CONFIGURED,
  PAYMENTS_ERROR.NETWORK,
  PAYMENTS_ERROR.TIMEOUT,
  PAYMENTS_ERROR.SERVER,
]);

export const isUnreachable = (code) => UNREACHABLE.has(code);

const fail = (error) => ({ ok: false, error });

export function createPaymentsClient({ fetchFn, getToken, baseUrl, timeoutMs = 15000 }) {
  async function call(method, path, body) {
    if (typeof baseUrl !== 'string' || !baseUrl.trim()) return fail(PAYMENTS_ERROR.NOT_CONFIGURED);
    let token;
    try {
      token = await getToken();
    } catch {
      return fail(PAYMENTS_ERROR.AUTH);
    }
    if (!token) return fail(PAYMENTS_ERROR.AUTH);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchFn(`${baseUrl.replace(/\/+$/, '')}${path}`, {
        method,
        headers: {
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          Authorization: `Bearer ${token}`,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timer);
      // An aborted request is a slow backend; any other fetch rejection means no network.
      return fail(controller.signal.aborted || error?.name === 'AbortError' ? PAYMENTS_ERROR.TIMEOUT : PAYMENTS_ERROR.NETWORK);
    }
    clearTimeout(timer);

    const status = response?.status;
    if (status === 401 || status === 403) return fail(PAYMENTS_ERROR.AUTH);
    if (status === 404) return fail(PAYMENTS_ERROR.NOT_FOUND);
    if (status === 429) return fail(PAYMENTS_ERROR.SERVER);
    if (status >= 500) {
      // The backend answers 502 { error: 'upstream_error' } when Mercado Pago failed; other 5xx are the server.
      if (status === 502 && (await readErrorCode(response)) === UPSTREAM_BODY_CODE) return fail(PAYMENTS_ERROR.PROVIDER);
      return fail(PAYMENTS_ERROR.SERVER);
    }
    if (!response.ok) {
      if (status === 400 && (await readErrorCode(response)) === NOT_CONFIGURED_BODY_CODE) return fail(PAYMENTS_ERROR.PROVIDER_NOT_CONFIGURED);
      return fail(PAYMENTS_ERROR.PROVIDER);
    }
    try {
      return { ok: true, data: await response.json() };
    } catch {
      return fail(PAYMENTS_ERROR.INVALID_RESPONSE);
    }
  }

  // `provider` is only sent when it is a non-empty string; the backend validates its value.
  const post = (path, tripId, provider) =>
    call('POST', path, typeof provider === 'string' && provider ? { tripId, provider } : { tripId });

  return {
    // Resolves { ok: true, providers: { mercadopago, stripe } } with booleans only.
    async getProviders() {
      const result = await call('GET', '/payments/providers');
      if (!result.ok) return result;
      const data = result.data;
      if (!data || typeof data !== 'object') return fail(PAYMENTS_ERROR.INVALID_RESPONSE);
      return { ok: true, providers: { mercadopago: data.mercadopago === true, stripe: data.stripe === true } };
    },
    // Resolves { ok: true, url } with an https checkout url.
    async requestCheckoutUrl(tripId, provider) {
      const result = await post('/payments/checkout', tripId, provider);
      if (!result.ok) return result;
      const url = result.data?.url;
      if (typeof url !== 'string' || !url.startsWith('https://')) return fail(PAYMENTS_ERROR.INVALID_RESPONSE);
      return { ok: true, url };
    },
    // Resolves { ok: true, paymentStatus } with what the backend wrote.
    async syncPayment(tripId, provider) {
      const result = await post('/payments/sync', tripId, provider);
      if (!result.ok) return result;
      const paymentStatus = result.data?.paymentStatus;
      if (typeof paymentStatus !== 'string') return fail(PAYMENTS_ERROR.INVALID_RESPONSE);
      return { ok: true, paymentStatus };
    },
  };
}

// The backend error body is { error: '<code>' }; an unreadable body is just "no code".
async function readErrorCode(response) {
  try {
    const body = await response.json();
    return typeof body?.error === 'string' ? body.error : null;
  } catch {
    return null;
  }
}
