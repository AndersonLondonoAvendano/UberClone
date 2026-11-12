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
export function send(res, result) {
  return res.status(result.status).json(result.body);
}
