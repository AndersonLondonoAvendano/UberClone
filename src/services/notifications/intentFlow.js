// AI-assisted: see docs/AI_LOG.md #64
// Decides what to do with the tapped-notification intent parked in the store (STOP-2c, D-146).
// Pure: every dependency is injected. The intent is stored as soon as it arrives, without judging it;
// it is evaluated only once the gate is ready (a session exists and the account status is resolved).
// Ready: discard silently if foreign/unapproved/on a trip, "expired" if late, otherwise offer it.
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { INTENT_DECISION, ignoreReason, resolveIntent } from './eligibility';
import { requestFromIntent } from './pushRequest';

export const FLOW_RESULT = {
  NONE: 'none',
  PENDING: 'pending',
  DROPPED: 'dropped',
  EXPIRED: 'expired',
  ADOPTED: 'adopted',
};

// getState() -> { uid, accountStatus, onTrip }; offer(request) -> boolean; showExpired(); log(code).
export function createIntentFlow({ intents, getState, offer, showExpired, now = () => Date.now(), log = () => {} }) {
  return {
    evaluate() {
      if (!intents.peek()) return FLOW_RESULT.NONE;
      const { uid, accountStatus, onTrip } = getState();
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
        const request = requestFromIntent(intent, ctx.now);
        if (request && offer(request) !== false) {
          log('intent-adopted');
          return FLOW_RESULT.ADOPTED;
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
