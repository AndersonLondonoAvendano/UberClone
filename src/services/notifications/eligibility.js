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
