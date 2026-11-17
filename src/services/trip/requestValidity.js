// AI-assisted: see docs/AI_LOG.md #73 (T-291, D-202)
// Validity of a request against the phone clock (pure; the clock is always passed in). `expiresAt` comes from
// the server, so the phone clock may be a few seconds off in either direction: tolerance is the only rule.
import { REQUEST_DECISION_WINDOW_MS } from '../../config/passengerApi';
import { REQUEST_CLOCK_TOLERANCE_MS } from '../../config/trip';

// True only when the request is really over: now >= expiresAt + tolerance. A non-numeric expiresAt is expired.
export function isRequestExpired(expiresAt, now, tolerance = REQUEST_CLOCK_TOLERANCE_MS) {
  if (!Number.isFinite(expiresAt) || !Number.isFinite(now)) return true;
  return now >= expiresAt + tolerance;
}

// Expiry to use once a still-valid request is adopted: never below "now + full decision window" (D-137).
export function effectiveExpiry(expiresAt, now, windowMs = REQUEST_DECISION_WINDOW_MS) {
  if (!Number.isFinite(expiresAt)) return expiresAt;
  return Math.max(expiresAt, now + windowMs);
}
