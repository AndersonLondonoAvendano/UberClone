// AI-assisted: see AI_LOG.md #55
// Pure decision of the charge state shown on "Cobro y resumen" and of the actions it offers
// (T-94, RF-44, CA-002-69). It reads the saved trip document (drivers/{uid}/trips/{tripId}) and
// returns { chip, actions }; the screen maps each id to its text in labels.trip.paymentChip and
// labels.trip.paymentAction. It never writes anything.
//
// Mercado Pago trip: pending -> CHARGE + VERIFY; rejected -> RETRY + VERIFY; approved or paid -> none.
// Cash trip: pending -> CONFIRM_CASH; paid -> none (chip 'cash' in both).
// Missing or legacy method ('transfer', 'none'), a cancelled trip or no trip -> 'unavailable', no actions.

import { PAYMENT_STATUS, TRIP_STATUS } from '../../constants/tripStatus';
import { isCardMethod, SAVED_PAYMENT } from './tripRecord';

export const PAYMENT_CHIP = {
  APPROVED: PAYMENT_STATUS.APPROVED,
  PENDING: PAYMENT_STATUS.PENDING,
  REJECTED: PAYMENT_STATUS.REJECTED,
  CASH: 'cash',
  UNAVAILABLE: 'unavailable',
};

export const PAYMENT_ACTION = {
  CHARGE: 'charge',
  RETRY: 'retry',
  VERIFY: 'verify',
  CONFIRM_CASH: 'confirmCash',
};

const NONE = { chip: PAYMENT_CHIP.UNAVAILABLE, actions: [] };

export function paymentView(trip) {
  // AI-assisted: see AI_LOG.md #66 (T-232: a rejected request was never driven, it has nothing to charge)
  if (!trip || typeof trip !== 'object') return NONE;
  if (trip.status === TRIP_STATUS.CANCELLED || trip.status === TRIP_STATUS.REJECTED) return NONE;
  const paid = trip.status === TRIP_STATUS.PAID;
  if (trip.paymentMethod === SAVED_PAYMENT.CASH) {
    const collected = paid || trip.paymentStatus === PAYMENT_STATUS.PAID;
    return { chip: PAYMENT_CHIP.CASH, actions: collected ? [] : [PAYMENT_ACTION.CONFIRM_CASH] };
  }
  // AI-assisted: see AI_LOG.md #58 (T-145: a Stripe trip is a card trip like Mercado Pago)
  if (isCardMethod(trip.paymentMethod)) {
    if (paid || trip.paymentStatus === PAYMENT_STATUS.APPROVED) return { chip: PAYMENT_CHIP.APPROVED, actions: [] };
    if (trip.paymentStatus === PAYMENT_STATUS.REJECTED) {
      return { chip: PAYMENT_CHIP.REJECTED, actions: [PAYMENT_ACTION.RETRY, PAYMENT_ACTION.VERIFY] };
    }
    return { chip: PAYMENT_CHIP.PENDING, actions: [PAYMENT_ACTION.CHARGE, PAYMENT_ACTION.VERIFY] };
  }
  return NONE;
}
