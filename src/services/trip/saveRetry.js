// AI-assisted: see docs/AI_LOG.md #50
// Bounded retry and error classification for saving a trip (T-46). Pure: the save function and the
// sleep are injected, so a script can test it without Firestore or real time.

export const SAVE_ERROR = { DENIED: 'denied', OFFLINE: 'offline', TIMEOUT: 'timeout', UNKNOWN: 'unknown' };

export function classifySaveError(error) {
  const code = String(error?.code ?? '');
  if (code.includes('permission-denied')) return SAVE_ERROR.DENIED;
  if (code === 'save-timeout') return SAVE_ERROR.TIMEOUT;
  if (code.includes('unavailable') || code.includes('network') || code.includes('deadline')) return SAVE_ERROR.OFFLINE;
  return SAVE_ERROR.UNKNOWN;
}

// Rejects with code 'save-timeout' if the promise does not settle in `ms`. Offline writes in
// Firestore wait forever for the network, so every save is raced against a clock.
export function withTimeout(promise, ms, timers = { set: setTimeout, clear: clearTimeout }) {
  let handle;
  const timeout = new Promise((_, reject) => {
    handle = timers.set(() => reject(Object.assign(new Error('save timed out'), { code: 'save-timeout' })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => timers.clear(handle));
}

// Calls save() up to `attempts` times, waiting delaysMs[i] between tries. A permission error is not
// retried (it would fail the same way). Resolves { ok: true } or { ok: false, kind }. Never throws.
export async function saveWithRetry(save, { attempts = 3, delaysMs = [2000, 5000], sleep = defaultSleep } = {}) {
  let kind = SAVE_ERROR.UNKNOWN;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await save();
      return { ok: true };
    } catch (error) {
      kind = classifySaveError(error);
      if (kind === SAVE_ERROR.DENIED || attempt === attempts - 1) break;
      await sleep(delaysMs[Math.min(attempt, delaysMs.length - 1)] ?? 0);
    }
  }
  return { ok: false, kind };
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
