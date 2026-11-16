// AI-assisted: see docs/AI_LOG.md #66
// Single decline point for a request the driver saw and did not accept (T-228, T-229, RE-06, D-183):
// a manual reject, the card countdown, the full-screen countdown or leaving the screen all end here.
// It saves ONE `rejected` record (zero amounts, null rating) through an injected save function and
// releases the request in the passenger API. Best effort: it never throws, never rejects and the UI
// never waits for it. Idempotent per request id; a request already accepted is ignored.
// Pure on purpose (no firebase import) so it can be tested in Node: the app wires it in declineRequestApp.js.

import { buildTripRecord, SAVED_STATUS } from './tripRecord';
import { withTimeout } from './saveRetry';

export const DECLINE_REASON = { REJECTED: 'rejected', EXPIRED: 'expired' };
export const DECLINE_RESULT = { SAVED: 'saved', SKIPPED: 'skipped', FAILED: 'failed' };
export const DECLINE_SAVE_TIMEOUT_MS = 5000;

const MAX_TRACKED = 200;
const declined = new Set();
const accepted = new Set();

function remember(set, id) {
  set.add(id);
  if (set.size > MAX_TRACKED) set.delete(set.values().next().value);
}

// Called after a successful accept: a later expiry or reject of the same id writes nothing.
export function markRequestAccepted(id) {
  if (id) remember(accepted, id);
}

export function resetDeclineStateForTest() {
  declined.clear();
  accepted.clear();
}

// reason: 'rejected' | 'expired'. save(uid, id, record, { timeoutMs }) is idempotent by id.
// reject(id) releases the request in the passenger API; release=false skips it (already released).
// resolveAddresses(request) is optional (keeps the geocoded labels). Returns a DECLINE_RESULT.
export async function declineRequest({
  uid,
  request,
  reason = DECLINE_REASON.REJECTED,
  save,
  reject,
  release = true,
  resolveAddresses = (value) => value,
  timers,
  timeoutMs = DECLINE_SAVE_TIMEOUT_MS,
  now = Date.now,
}) {
  const id = request?.id;
  if (!id) return DECLINE_RESULT.SKIPPED;
  if (accepted.has(id) || declined.has(id)) return DECLINE_RESULT.SKIPPED;
  remember(declined, id);

  // The release never depends on the save, and neither blocks the caller.
  if (release && typeof reject === 'function') {
    Promise.resolve()
      .then(() => reject(id))
      .catch(() => {});
  }
  if (!uid || typeof save !== 'function') return DECLINE_RESULT.SKIPPED;

  try {
    const record = buildTripRecord({
      driverId: uid,
      tripId: id,
      request: resolveAddresses(request),
      status: SAVED_STATUS.REJECTED,
      finishedAt: now(),
    });
    await withTimeout(Promise.resolve(save(uid, id, record, { timeoutMs })), timeoutMs, timers);
    return DECLINE_RESULT.SAVED;
  } catch {
    return DECLINE_RESULT.FAILED;
  }
}
