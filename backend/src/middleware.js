// AI-assisted: see docs/AI_LOG.md #55
// Framework-independent defenses: fixed-window rate limiter and an auth + limit guard.
// Nothing here logs tokens, headers or bodies.

export function createRateLimiter({ max, windowMs, now = () => Date.now() }) {
  const windows = new Map();
  return {
    // Returns true when the call is allowed.
    hit(key) {
      const time = now();
      if (windows.size > 5000) {
        for (const [k, w] of windows) if (w.resetAt <= time) windows.delete(k);
      }
      const current = windows.get(key);
      if (!current || current.resetAt <= time) {
        windows.set(key, { count: 1, resetAt: time + windowMs });
        return true;
      }
      current.count += 1;
      return current.count <= max;
    },
  };
}

export const ERRORS = {
  unauthorized: { status: 401, body: { error: 'unauthorized' } },
  invalid: { status: 400, body: { error: 'invalid_request' } },
  providerNotConfigured: { status: 400, body: { error: 'provider_not_configured' } },
  notFound: { status: 404, body: { error: 'not_found' } },
  rateLimited: { status: 429, body: { error: 'rate_limited' } },
  tooLarge: { status: 413, body: { error: 'payload_too_large' } },
  upstream: { status: 502, body: { error: 'upstream_error' } },
  server: { status: 500, body: { error: 'server_error' } },
};

// Returns { uid } or an { status, body } error result. IP limit first (cheap, pre-auth), then the
// token, then the per-user limit.
export function createGuard({ auth, userLimiter, ipLimiter }) {
  return async function guard({ authorization, ip }) {
    if (!ipLimiter.hit(`ip:${ip ?? 'unknown'}`)) return ERRORS.rateLimited;
    let uid;
    try {
      uid = await auth.verifyToken(authorization);
    } catch {
      return ERRORS.unauthorized;
    }
    if (!userLimiter.hit(`uid:${uid}`)) return ERRORS.rateLimited;
    return { uid };
  };
}

// Writes an { status, body } result to an Express-like response.
// A handler may add result.provider (a gateway id): it is only kept for the request log line, never sent.
export function send(res, result) {
  if (typeof result.provider === 'string' && res.locals) res.locals.provider = result.provider;
  return res.status(result.status).json(result.body);
}

// AI-assisted: see docs/AI_LOG.md #59
// One line per request: method, path, status, provider and duration. Never bodies, headers, tokens or emails.
// The path is req.path (no query string). The provider is only ever a known gateway id, else "-".
const LOGGED_PROVIDERS = ['mercadopago', 'stripe'];
// write is injected by server.js (the only file that logs); without it nothing is written.
export function createRequestLogger(write = () => {}, now = () => Date.now()) {
  return (req, res, next) => {
    const started = now();
    res.on('finish', () => {
      const fromBody = typeof req.body?.provider === 'string' ? req.body.provider : null;
      const candidate = res.locals.provider ?? fromBody;
      const provider = LOGGED_PROVIDERS.includes(candidate) ? candidate : '-';
      write(`[req] ${req.method} ${req.path} ${res.statusCode} provider=${provider} ${now() - started}ms`);
    });
    next();
  };
}
