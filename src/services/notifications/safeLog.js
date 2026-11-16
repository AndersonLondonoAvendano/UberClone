// AI-assisted: see docs/AI_LOG.md #64
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
