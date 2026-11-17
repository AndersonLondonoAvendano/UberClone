// AI-assisted: see docs/AI_LOG.md #66
// Metrics state of an incoming request (A1, R-084). A request from a push is first shown with what the
// message carries (passenger, category) and `metricsPending: true`: its distance, duration and fare are NOT
// shown yet. When the real route answers (or the cap passes) the pending mark is removed and only then the
// fare is computed and the 15 s decision window (D-137) starts. Pure: no React, no clock, no network.
import { calculateFare } from '../../utils/fare';

export const isMetricsPending = (request) => Boolean(request) && request.metricsPending === true;

export const withMetricsPending = (request) => ({ ...request, metricsPending: true });

// The same request without the pending mark (the final copy).
export function withoutMetricsPending(request) {
  const { metricsPending, ...rest } = request;
  return rest;
}

// The fare shown to the driver: null while the metrics are pending (never a fare from provisional numbers)
// or if it cannot be computed. `calculate` is injectable for tests.
export function displayFare(request, calculate = calculateFare) {
  if (!request || isMetricsPending(request)) return null;
  try {
    return calculate({ distanceKm: request.distanceKm, durationMin: request.durationMin, category: request.category });
  } catch {
    return null;
  }
}

// Accept and reject are inactive until the final data is there (or while working / already decided).
export const canDecide = (request, { working = false } = {}) =>
  Boolean(request) && !isMetricsPending(request) && !working;

// Instant the 15 s window must be marked, or null while the data is still pending (D-137: the window starts
// when the FINAL data is shown).
export const decisionWindowStart = (request, now) => (request && !isMetricsPending(request) ? now : null);

// Resolves with `fallback` if `promise` has not settled within `ms` (never rejects). The late answer is ignored.
export function withCap(promise, ms, fallback, { setTimer = (fn, delay) => setTimeout(fn, delay), clearTimer = (id) => clearTimeout(id) } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimer(timer);
      resolve(value);
    };
    const timer = setTimer(() => finish(fallback), ms);
    Promise.resolve(promise).then(finish, () => finish(fallback));
  });
}

// AI-assisted: see docs/AI_LOG.md #73 (T-293, D-203)
// Which copy of a request the full screen shows. `opened` is the copy it opened with (often metricsPending),
// `pending` the gate's current one and `lastFinal` the last copy WITH final data it has seen. When the slot is
// released (taken, expired) the last final copy is kept, so a notice never appears over "Calculando" skeletons.
// Returns { request, lastFinal } (the caller stores lastFinal).
export function resolveShownRequest({ opened, pending, lastFinal }) {
  const sameAsOpened = (candidate) => Boolean(candidate) && Boolean(opened) && candidate.id === opened.id;
  const current = sameAsOpened(pending) ? pending : null;
  const nextFinal = current && !isMetricsPending(current) ? current : sameAsOpened(lastFinal) ? lastFinal : null;
  return { request: current ?? nextFinal ?? opened ?? null, lastFinal: nextFinal };
}
