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
