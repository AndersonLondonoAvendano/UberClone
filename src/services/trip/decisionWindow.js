// AI-assisted: see AI_LOG.md #64
// Decision window of an incoming request (T-194, D-137): 15 s counted from the first time the
// request is shown, capped by its validity (expiresAt). Pure and injectable; nothing here touches
// React or timers. markShown keeps the FIRST instant, so re-renders or reopening never extend it.
import { REQUEST_DECISION_WINDOW_MS } from '../../config/passengerApi';

const SHOWN_MAX = 50;

export function createDecisionWindow({ windowMs = REQUEST_DECISION_WINDOW_MS } = {}) {
  const shown = new Map();

  return {
    markShown(id, now) {
      if (id === undefined || id === null || !Number.isFinite(now)) return;
      if (shown.has(id)) return;
      shown.set(id, now);
      if (shown.size > SHOWN_MAX) shown.delete(shown.keys().next().value);
    },
    // Instant (ms) when the driver can no longer decide. Not yet shown: counts from `now`.
    deadline(request, now) {
      const base = shown.has(request.id) ? shown.get(request.id) : now;
      const end = base + windowMs;
      return Number.isFinite(request.expiresAt) ? Math.min(end, request.expiresAt) : end;
    },
    remainingMs(request, now) {
      return Math.max(0, this.deadline(request, now) - now);
    },
    reset() {
      shown.clear();
    },
    windowMs,
  };
}

const defaultWindow = createDecisionWindow();

export const markShown = (id, now) => defaultWindow.markShown(id, now);
export const decisionDeadline = (request, now) => defaultWindow.deadline(request, now);
export const decisionRemainingMs = (request, now) => defaultWindow.remainingMs(request, now);
export const resetDecisionWindow = () => defaultWindow.reset();
