// AI-assisted: see docs/AI_LOG.md #64
// Who may be shown a request that arrived by notification (T-178, D-140.5). Pure.
// 'open' = show it; 'expired' = say "La solicitud expiró"; 'ignore' = do nothing, say nothing.

export const INTENT_DECISION = {
  OPEN: 'open',
  EXPIRED: 'expired',
  IGNORE: 'ignore',
};

// session: { uid } | null. A notification for another account, without session, with the account
// not approved or during a trip is ignored silently; only a valid, eligible-but-late one is "expired".
export function resolveIntent(intent, { session, accountApproved, onTrip, now }) {
  if (!intent) return INTENT_DECISION.IGNORE;
  const uid = session?.uid;
  if (!uid || intent.targetUid !== uid) return INTENT_DECISION.IGNORE;
  if (!accountApproved || onTrip) return INTENT_DECISION.IGNORE;
  if (typeof intent.expiresAt !== 'number' || intent.expiresAt <= now) return INTENT_DECISION.EXPIRED;
  return INTENT_DECISION.OPEN;
}

// D-201: availability has three states. 'restoring' = the saved choice is still being read.
export const AVAILABILITY_STATE = {
  RESTORING: 'restoring',
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
};

// A2 (D-181) + D-201: a request is offered only while the driver is Disponible.
// Returns true (offer), false (explicit "No disponible": notice, nothing offered) or null (still
// restoring: not known yet, the caller waits). Accepts the booleans or the state strings. undefined counts
// as available so callers that do not track it keep the D-133/D-146 behavior.
export function isDriverAvailable(available) {
  if (available === null || available === AVAILABILITY_STATE.RESTORING) return null;
  return available !== false && available !== AVAILABILITY_STATE.UNAVAILABLE;
}

// Single-slot notice: a second notice while one is visible is dropped (no repeat, no stack).
export function mergeNotice(previous, next) {
  return previous ?? next;
}

// Fixed, content-free reason code for an 'ignore' decision (dev logs only; never a uid or a name).
export function ignoreReason(intent, { session, accountApproved, onTrip }) {
  if (!intent) return 'no-intent';
  const uid = session?.uid;
  if (!uid) return 'no-session';
  if (intent.targetUid !== uid) return 'uid-mismatch';
  if (!accountApproved) return 'not-approved';
  if (onTrip) return 'on-trip';
  return 'unknown';
}
