// AI-assisted: see docs/AI_LOG.md #64
// Decides what to do with the tapped-notification intent parked in the store (STOP-2c, D-146).
// Pure: every dependency is injected. The intent is stored as soon as it arrives, without judging it;
// it is evaluated only once the gate is ready (a session exists and the account status is resolved).
// Ready: discard silently if foreign/unapproved/on a trip, "expired" if late, otherwise offer it.
// D-201: while the availability is still 'restoring' (null) the intent waits parked (WAITING), at most
// awaitAvailabilityMs from the first time it had to wait; after that it counts as "No disponible" (notice
// once). The wait re-evaluates by itself at the cap through the injected timer (cancelWait() on unmount).
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { INTENT_DECISION, ignoreReason, isDriverAvailable, resolveIntent } from './eligibility';
import { isRequestExpired } from '../trip/requestValidity';
import { requestFromIntent } from './pushRequest';

export const FLOW_RESULT = {
  NONE: 'none',
  PENDING: 'pending',
  DROPPED: 'dropped',
  EXPIRED: 'expired',
  ADOPTED: 'adopted',
  UNAVAILABLE: 'unavailable', // eligible request but the driver is not Disponible (A2, D-181)
  WAITING: 'waiting', // the saved availability is still being restored (D-201); the intent stays parked
};

// getState() -> { uid, accountStatus, onTrip, available }; offer(request) -> boolean | Promise<boolean>;
// showExpired(); showUnavailable(); log(code). `available` undefined counts as available (older callers);
// null / 'restoring' means "not known yet" (see isDriverAvailable).
// evaluate() is async (T-199): it resolves to a FLOW_RESULT once the offer (and its route lookup) finished.
export function createIntentFlow({
  intents,
  getState,
  offer,
  showExpired,
  showUnavailable = () => {},
  now = () => Date.now(),
  log = () => {},
  awaitAvailabilityMs = 0,
  setTimeoutFn = (callback, ms) => setTimeout(callback, ms),
  clearTimeoutFn = (handle) => clearTimeout(handle),
}) {
  let waitStartedAt = null;
  let waitTimer = null;

  const cancelWait = () => {
    if (waitTimer !== null) clearTimeoutFn(waitTimer);
    waitTimer = null;
  };

  const flow = {
    async evaluate() {
      if (!intents.peek()) {
        waitStartedAt = null;
        return FLOW_RESULT.NONE;
      }
      const { uid, accountStatus, onTrip, available: reported } = getState();
      if (!uid || accountStatus === ACCOUNT_STATUS.LOADING) {
        log('gate-pending');
        return FLOW_RESULT.PENDING;
      }
      let available = reported;
      if (isDriverAvailable(reported) === null) {
        if (waitStartedAt === null) waitStartedAt = now();
        const remaining = awaitAvailabilityMs - (now() - waitStartedAt);
        if (remaining > 0) {
          log('gate-pending:availability');
          if (waitTimer === null) {
            waitTimer = setTimeoutFn(() => {
              waitTimer = null;
              flow.evaluate().catch(() => {});
            }, remaining);
          }
          return FLOW_RESULT.WAITING;
        }
        available = false; // the wait is over: counts as "No disponible"
      }
      cancelWait();
      waitStartedAt = null;
      log('gate-ready');
      const intent = intents.take(uid); // always empties the store
      const ctx = {
        session: { uid },
        accountApproved: accountStatus === ACCOUNT_STATUS.APPROVED,
        onTrip: Boolean(onTrip),
        now: now(),
      };
      if (!intent) {
        log('intent-dropped:uid-mismatch');
        return FLOW_RESULT.DROPPED;
      }
      const decision = resolveIntent(intent, ctx);
      if (decision === INTENT_DECISION.EXPIRED) {
        showExpired();
        log('intent-expired');
        log('expired-clock');
        return FLOW_RESULT.EXPIRED;
      }
      if (decision === INTENT_DECISION.OPEN) {
        // A2 (D-181): checked after expiry, so a late request still says "expired".
        if (!isDriverAvailable(available)) {
          showUnavailable();
          log('intent-dropped:not-available');
          return FLOW_RESULT.UNAVAILABLE;
        }
        const request = requestFromIntent(intent, ctx.now);
        // T-199: offer may wait for the route lookup (<= 2.5 s); the intent was already taken above, so a
        // second evaluate() during the wait finds nothing and cannot offer twice.
        const offered = request ? (await offer(request)) !== false : false;
        if (offered) {
          log('intent-adopted');
          return FLOW_RESULT.ADOPTED;
        }
        // AI-assisted: see docs/AI_LOG.md #73 (D-202: same tolerance as everywhere)
        if (request && isRequestExpired(request.expiresAt, now())) {
          // Expired while the route was being refined.
          showExpired();
          log('intent-expired');
          return FLOW_RESULT.EXPIRED;
        }
        log('intent-dropped:rejected');
        return FLOW_RESULT.DROPPED;
      }
      log(`intent-dropped:${ignoreReason(intent, ctx)}`);
      return FLOW_RESULT.DROPPED;
    },
    // Sign-out: nothing from the previous account survives.
    reset() {
      cancelWait();
      waitStartedAt = null;
      intents.reset();
    },
    // Unmount: the pending re-evaluation timer is released (the intent stays parked).
    cancelWait,
  };
  return flow;
}
