// AI-assisted: see docs/AI_LOG.md #55
// Pure runner of the charge actions of "Cobro y resumen" (T-97, RF-44, CA-002-70..72). The services and
// the URL opener are injected, so a script can test it without network, Firebase or the browser.
//
// - Only one action runs at a time (a double tap, or the automatic sync racing a button, is ignored).
// - It NEVER writes a card payment: the card state changes only in the trip document (onSnapshot), written
//   by the backend. Opening the browser or a successful sync response is not proof of payment.
// - It never throws: every run resolves { ok: true } | { ok: false, error } | { skipped: true }.

import { PAYMENT_ACTION } from './paymentView';

export const ACTION_ERROR = {
  OFFLINE: 'offline',
  BACKEND_UNAVAILABLE: 'backendUnavailable',
  FAILED: 'failed',
  OPEN_FAILED: 'openFailed',
  CASH_FAILED: 'cashFailed',
};

const KNOWN_CLIENT_ERRORS = new Set([ACTION_ERROR.OFFLINE, ACTION_ERROR.BACKEND_UNAVAILABLE, ACTION_ERROR.FAILED]);
const clientError = (result) => (KNOWN_CLIENT_ERRORS.has(result?.error) ? result.error : ACTION_ERROR.FAILED);

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

  async function checkout(tripId) {
    const result = await requestCheckoutUrl(tripId);
    if (!result?.ok) return { ok: false, error: clientError(result) };
    try {
      await openUrl(result.url);
    } catch {
      return { ok: false, error: ACTION_ERROR.OPEN_FAILED };
    }
    return { ok: true };
  }

  async function sync(tripId) {
    const result = await syncPayment(tripId);
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
    run(action, { uid, tripId }) {
      if (!tripId) return Promise.resolve({ ok: false, error: ACTION_ERROR.FAILED });
      if (action === PAYMENT_ACTION.CHARGE || action === PAYMENT_ACTION.RETRY) return guarded(() => checkout(tripId));
      if (action === PAYMENT_ACTION.VERIFY) return guarded(() => sync(tripId));
      if (action === PAYMENT_ACTION.CONFIRM_CASH) {
        if (!uid) return Promise.resolve({ ok: false, error: ACTION_ERROR.CASH_FAILED });
        return guarded(() => cash(uid, tripId));
      }
      return Promise.resolve({ ok: false, error: ACTION_ERROR.FAILED });
    },
  };
}
