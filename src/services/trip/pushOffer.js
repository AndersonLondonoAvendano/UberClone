// AI-assisted: see docs/AI_LOG.md #64
// Order of a push offer (S3 fix, D-135): the gate decides first (dedupe), and only an OFFERED request is
// adopted in the passenger adapter. If the adapter then refuses it, the gate slot is released, so a
// duplicate never touches the mock and a refused request never stays pending. Pure: dependencies injected.

import { OFFER_RESULT } from './pendingRequest';

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

// RC-01/RC-02 (T-199): the request is refined (one route lookup) BEFORE it reaches the gate. While the
// lookup runs, the same request id is shared through `inFlight`, so a second message or tap joins the same
// promise (no second lookup, no duplicate). Expiry is checked again after the wait; the gate and the adapter
// only ever see the refined copy. Returns a Promise of PUSH_OFFER_RESULT (never rejects).
// refine(request) -> Promise<request>; onOffered(refined) runs once, only when it became pending.
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
    let refined = request;
    try {
      refined = await refine(request);
    } catch {
      refined = request;
    }
    if (!isCurrent()) return PUSH_OFFER_RESULT.REJECTED;
    if (refined.expiresAt <= now()) return PUSH_OFFER_RESULT.EXPIRED;
    const result = offerPushWithArrival({ gate, adopt, request: refined, tap, now });
    if (result === PUSH_OFFER_RESULT.OFFERED) onOffered(refined);
    return result;
  })().finally(() => {
    inFlight.delete(request.id);
  });
  inFlight.set(request.id, run);
  return run;
}
