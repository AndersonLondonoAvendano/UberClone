// AI-assisted: see docs/AI_LOG.md #64
// Order of a push offer (S3 fix, D-135): the gate decides first (dedupe), and only an OFFERED request is
// adopted in the passenger adapter. If the adapter then refuses it, the gate slot is released, so a
// duplicate never touches the mock and a refused request never stays pending. Pure: dependencies injected.

import { OFFER_RESULT } from './pendingRequest';
import { withCap, withMetricsPending, withoutMetricsPending } from './requestMetrics';

// adopt(request) returns true when the adapter accepted it. Returns true only when it became pending.
export function offerPushThroughGate({ gate, adopt, request }) {
  if (gate.offer(request) !== OFFER_RESULT.OFFERED) return false;
  let adopted = false;
  try {
    adopted = adopt(request) === true;
  } catch {
    adopted = false;
  }
  if (!adopted) {
    gate.release(request.id);
    return false;
  }
  return true;
}

export const PUSH_OFFER_RESULT = {
  OFFERED: 'offered', // became pending now
  PROMOTED: 'promoted', // tap on a request that is already pending: same id, timer untouched (D-149)
  REJECTED: 'not_offered',
  EXPIRED: 'expired', // expired before or during the route lookup (T-199)
};

// A tap on a request that already shows as a card is a promotion, not a duplicate: the gate keeps its
// slot and its timer (the 15 s window is not restarted; decisionWindow.markShown keeps the first instant).
// Without a tap (or for another id) it is the plain offer.
export function offerPushWithArrival({ gate, adopt, request, tap = false, now = Date.now }) {
  const pending = gate.get();
  if (tap && pending && pending.id === request.id && pending.expiresAt > now()) return PUSH_OFFER_RESULT.PROMOTED;
  return offerPushThroughGate({ gate, adopt, request }) ? PUSH_OFFER_RESULT.OFFERED : PUSH_OFFER_RESULT.REJECTED;
}

// A1 (RC-01/RC-02, R-084, supersedes the T-199 order "refine, then offer"): the request reaches the gate AT
// ONCE with what the message carries (passenger, category) and `metricsPending: true`, so the full screen
// opens without waiting for the route. In the background the request is refined (one route lookup, at most
// `capMs`; after it the message values are used, marked `estimated`). The final copy is then adopted by the
// adapter and replaces the pending one (`gate.update`); only then do the fare and the 15 s window exist.
// While the lookup runs, the same request id is shared through `inFlight`, so a second message or tap joins
// the same promise (no second lookup, no duplicate). Expiry is checked again after the wait.
// Returns a Promise of PUSH_OFFER_RESULT (never rejects), settled when the final data is in (or it failed).
// refine(request) -> Promise<request>; onOffered(preliminary) runs once, at once, when it became pending;
// onFinal(final, { capped }) runs once when the final copy replaced the pending one.
export function offerPushRefined({
  gate,
  adopt,
  request,
  refine,
  inFlight,
  tap = false,
  now = Date.now,
  isCurrent = () => true,
  onOffered = () => {},
  onFinal = () => {},
  capMs = 3000,
  setTimer,
  clearTimer,
}) {
  const shared = inFlight.get(request.id);
  if (shared) return shared;

  const pending = gate.get();
  if (tap && pending && pending.id === request.id && pending.expiresAt > now()) {
    return Promise.resolve(PUSH_OFFER_RESULT.PROMOTED);
  }
  if (request.expiresAt <= now()) return Promise.resolve(PUSH_OFFER_RESULT.EXPIRED);
  if (pending && pending.expiresAt > now()) return Promise.resolve(PUSH_OFFER_RESULT.REJECTED); // busy

  const run = (async () => {
    // Shown at once: the gate only dedupes and the adapter is NOT touched yet (it adopts the final copy).
    const preliminary = withMetricsPending(request);
    if (gate.offer(preliminary) !== OFFER_RESULT.OFFERED) return PUSH_OFFER_RESULT.REJECTED;
    onOffered(preliminary);

    const fallback = { ...withoutMetricsPending(request), estimated: true };
    let capped = false;
    let refined = fallback;
    try {
      const marker = Symbol('cap');
      const outcome = await withCap(refine(withoutMetricsPending(request)), capMs, marker, { setTimer, clearTimer });
      if (outcome === marker) capped = true;
      else refined = outcome;
    } catch {
      refined = fallback;
    }
    const final = withoutMetricsPending(refined);
    if (!isCurrent()) {
      gate.release(request.id);
      return PUSH_OFFER_RESULT.REJECTED;
    }
    const stillPending = gate.get();
    if (!stillPending || stillPending.id !== request.id) {
      // Decided, released or expired while the route was being looked up.
      return final.expiresAt <= now() ? PUSH_OFFER_RESULT.EXPIRED : PUSH_OFFER_RESULT.REJECTED;
    }
    if (final.expiresAt <= now()) {
      gate.release(request.id);
      return PUSH_OFFER_RESULT.EXPIRED;
    }
    let adopted = false;
    try {
      adopted = adopt(final) === true;
    } catch {
      adopted = false;
    }
    if (!adopted) {
      gate.release(request.id);
      return PUSH_OFFER_RESULT.REJECTED;
    }
    gate.update(final);
    onFinal(final, { capped });
    return PUSH_OFFER_RESULT.OFFERED;
  })().finally(() => {
    inFlight.delete(request.id);
  });
  inFlight.set(request.id, run);
  return run;
}
