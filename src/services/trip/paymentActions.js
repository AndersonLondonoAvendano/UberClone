// AI-assisted: see docs/AI_LOG.md #55
// AI-assisted: see docs/AI_LOG.md #58
// Pure runner of the charge actions of "Cobro y resumen" (T-97, RF-44, CA-002-70..72). The services and
// the URL opener are injected, so a script can test it without network, Firebase or the browser.
//
// - Only one action runs at a time (a double tap, or the automatic sync racing a button, is ignored).
// - It NEVER writes a card payment: the card state changes only in the trip document (onSnapshot), written
//   by the backend. Opening the browser or a successful sync response is not proof of payment.
// - It never throws: every run resolves { ok: true } | { ok: false, error } | { skipped: true }.

import { PAYMENT_ACTION } from './paymentView';
import { PAYMENTS_ERROR } from './paymentsClient';

export const ACTION_ERROR = {
  OFFLINE: 'offline',
  BACKEND_UNAVAILABLE: 'backendUnavailable',
  FAILED: 'failed',
  OPEN_FAILED: 'openFailed',
  CASH_FAILED: 'cashFailed',
};

// AI-assisted: see docs/AI_LOG.md #57
// T-126 (RF-57): the client class (one of the eight PAYMENTS_ERROR values) travels unchanged to the
// screen, which picks one message per class. The legacy codes stay valid; anything unknown is failed.
const KNOWN_CLIENT_ERRORS = new Set([
  ...Object.values(PAYMENTS_ERROR),
  ACTION_ERROR.OFFLINE,
  ACTION_ERROR.BACKEND_UNAVAILABLE,
  ACTION_ERROR.FAILED,
]);

function clientError(result) {
  const code = result?.error;
  return KNOWN_CLIENT_ERRORS.has(code) ? code : ACTION_ERROR.FAILED;
}

export function createPaymentActions({ requestCheckoutUrl, syncPayment, confirmCashPayment, openUrl }) {
  let inFlight = false;

  async function guarded(task) {
    if (inFlight) return { skipped: true };
    inFlight = true;
    try {
      return await task();
    } finally {
      inFlight = false;
    }
  }

  async function checkout(tripId, provider) {
    const result = await requestCheckoutUrl(tripId, provider);
    if (!result?.ok) return { ok: false, error: clientError(result) };
    try {
      await openUrl(result.url);
    } catch {
      return { ok: false, error: ACTION_ERROR.OPEN_FAILED };
    }
    return { ok: true };
  }

  async function sync(tripId, provider) {
    const result = await syncPayment(tripId, provider);
    return result?.ok ? { ok: true } : { ok: false, error: clientError(result) };
  }

  async function cash(uid, tripId) {
    try {
      await confirmCashPayment(uid, tripId);
      return { ok: true };
    } catch {
      return { ok: false, error: ACTION_ERROR.CASH_FAILED };
    }
  }

  return {
    isBusy: () => inFlight,
    // action is one of PAYMENT_ACTION; RETRY opens a new checkout exactly like CHARGE.
    // AI-assisted: see docs/AI_LOG.md #58 (T-146, DP-48)
    // CHARGE and RETRY require `provider` (the gateway of the pressed button). VERIFY takes the gateway
    // recorded in the trip document (paymentMethod), never the last button; without it the body is legacy.
    run(action, { uid, tripId, provider }) {
      if (!tripId) return Promise.resolve({ ok: false, error: ACTION_ERROR.FAILED });
      if (action === PAYMENT_ACTION.CHARGE || action === PAYMENT_ACTION.RETRY) {
        if (typeof provider !== 'string' || !provider) return Promise.resolve({ ok: false, error: ACTION_ERROR.FAILED });
        return guarded(() => checkout(tripId, provider));
      }
      if (action === PAYMENT_ACTION.VERIFY) return guarded(() => sync(tripId, provider));
      if (action === PAYMENT_ACTION.CONFIRM_CASH) {
        if (!uid) return Promise.resolve({ ok: false, error: ACTION_ERROR.CASH_FAILED });
        return guarded(() => cash(uid, tripId));
      }
      return Promise.resolve({ ok: false, error: ACTION_ERROR.FAILED });
    },
  };
}
