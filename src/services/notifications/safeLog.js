// AI-assisted: see AI_LOG.md #64
// Safe logging for push tokens: a token is a credential and never leaves the device in full.

const VISIBLE_CHARS = 8;

// Returns only the first 8 characters plus the length, e.g. `abcd1234… (len 163)`.
// Tolerant to null, undefined and non-string input. Never returns the complete token.
export function maskToken(token) {
  if (typeof token !== 'string' || token.length === 0) return '(no token)';
  // Short tokens show at most length - 1 characters so the full value is never revealed.
  const visible = token.slice(0, Math.min(VISIBLE_CHARS, token.length - 1));
  return `${visible}… (len ${token.length})`;
}

// Writes `label: <masked token>` only when `isDev` is true. `log` is injected so tests can observe it.
export function logTokenInDev(label, token, { isDev = false, log } = {}) {
  if (isDev !== true || typeof log !== 'function') return;
  log(`${label}: ${maskToken(token)}`);
}

// Dev-only push flow trace: a fixed reason code, e.g. `[push] intent-adopted`. Never a token, body,
// name or uid. Reaches `adb logcat -s ReactNativeJS:V` because console.log goes through React Native.
export function logPushEvent(code, { isDev = false, log } = {}) {
  if (isDev !== true || typeof log !== 'function') return;
  log(`[push] ${code}`);
}

// AI-assisted: see AI_LOG.md #66
// Dev-only timing trace (A1): a fixed code plus elapsed milliseconds, e.g. `[push] metrics-final ms=840`.
// Only a code and a number: no token, name, address or coordinates.
export function logPushTiming(code, ms, { isDev = false, log } = {}) {
  if (isDev !== true || typeof log !== 'function' || !Number.isFinite(ms)) return;
  log(`[push] ${code} ms=${Math.round(ms)}`);
}

// AI-assisted: see AI_LOG.md #73 (T-292, D-202)
// Dev-only trace for callers that have no injected logger: same fixed code, console only when __DEV__.
// Codes are fixed words (adopted, expired-clock, released, taken-by-other); never a token, name or uid.
export function logPushEventDev(code) {
  logPushEvent(code, {
    isDev: typeof __DEV__ !== 'undefined' && __DEV__ === true,
    log: (message) => console.log(message),
  });
}
