// AI-assisted: see docs/AI_LOG.md #64
// Decides what to do with the tapped-notification intent parked in the store (STOP-2c, D-146).
// Pure: every dependency is injected. The intent is stored as soon as it arrives, without judging it;
// it is evaluated only once the gate is ready (a session exists and the account status is resolved).
// Ready: discard silently if foreign/unapproved/on a trip, "expired" if late, otherwise offer it.
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { INTENT_DECISION, ignoreReason, isDriverAvailable, resolveIntent } from './eligibility';
import { requestFromIntent } from './pushRequest';

export const FLOW_RESULT = {
  NONE: 'none',
  PENDING: 'pending',
  DROPPED: 'dropped',
  EXPIRED: 'expired',
  ADOPTED: 'adopted',
  UNAVAILABLE: 'unavailable', // eligible request but the driver is not Disponible (A2, D-181)
};

// getState() -> { uid, accountStatus, onTrip, available }; offer(request) -> boolean | Promise<boolean>;
// showExpired(); showUnavailable(); log(code). `available` undefined counts as available (older callers).
// evaluate() is async (T-199): it resolves to a FLOW_RESULT once the offer (and its route lookup) finished.
export function createIntentFlow({ intents, getState, offer, showExpired, showUnavailable = () => {}, now = () => Date.now(), log = () => {} }) {
  return {
    async evaluate() {
      if (!intents.peek()) return FLOW_RESULT.NONE;
      const { uid, accountStatus, onTrip, available } = getState();
      if (!uid || accountStatus === ACCOUNT_STATUS.LOADING) {
        log('gate-pending');
        return FLOW_RESULT.PENDING;
      }
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
        if (request && now() >= request.expiresAt) {
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
      intents.reset();
    },
  };
}
