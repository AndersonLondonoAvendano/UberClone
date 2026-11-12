// AI-assisted: see docs/AI_LOG.md #55
// POST /payments/checkout and POST /payments/sync. The amount always comes from the trip document
//; anything else in the body is ignored.
import { ERRORS, send as defaultSend } from '../middleware.js';
import { mapPaymentStatus, paymentMatchesTrip } from '../mercadopago.js';

const TRIP_ID = /^[A-Za-z0-9_-]{1,128}$/;

export function validTripId(value) {
  return typeof value === 'string' && TRIP_ID.test(value);
}

function validAmount(trip, maxAmount) {
  return Number.isInteger(trip.fare) && trip.fare > 0 && trip.fare <= maxAmount;
}

export function createPaymentsHandlers({ store, mp, config }) {
  return {
    async checkout({ uid, body }) {
      const tripId = body?.tripId;
      if (!validTripId(tripId)) return ERRORS.invalid;
      const trip = await store.getTrip(uid, tripId);
      if (!trip) return ERRORS.notFound;
      if (trip.status !== 'completed' || trip.paymentMethod !== 'mercadopago' || trip.paymentStatus === 'approved') {
        return ERRORS.invalid;
      }
      if (!validAmount(trip, config.maxAmountCop)) return ERRORS.invalid;
      try {
        const { url } = await mp.createPreference({
          tripId,
          uid,
          amount: trip.fare,
          currency: config.currency,
          notificationUrl: `${config.publicBaseUrl}/webhooks/mercadopago`,
        });
        return { status: 200, body: { url } };
      } catch {
        return ERRORS.upstream;
      }
    },

    async sync({ uid, body }) {
      const tripId = body?.tripId;
      if (!validTripId(tripId)) return ERRORS.invalid;
      const trip = await store.getTrip(uid, tripId);
      if (!trip) return ERRORS.notFound;
      if (trip.paymentMethod !== 'mercadopago' || (trip.status !== 'completed' && trip.status !== 'paid')) {
        return ERRORS.invalid;
      }
      if (trip.paymentStatus === 'approved') return { status: 200, body: { paymentStatus: 'approved' } };
      try {
        const payment = await mp.findPaymentByReference(tripId);
        if (!payment || !paymentMatchesTrip(payment, tripId, trip, config.currency)) {
          return { status: 200, body: { paymentStatus: trip.paymentStatus ?? 'pending' } };
        }
        const result = await store.applyPayment(uid, tripId, {
          status: mapPaymentStatus(payment.status),
          id: payment.id,
        });
        return { status: 200, body: { paymentStatus: result.paymentStatus ?? trip.paymentStatus ?? 'pending' } };
      } catch {
        return ERRORS.upstream;
      }
    },
  };
}

// send(res, result) writes { status, body }; any thrown error becomes a generic 500.
export function registerPaymentsRoutes(app, { guard, handlers, send = defaultSend }) {
  const route = (name) => async (req, res) => {
    try {
      const guarded = await guard({ authorization: req.headers?.authorization, ip: req.ip });
      if (!guarded.uid) return send(res, guarded);
      return send(res, await handlers[name]({ uid: guarded.uid, body: req.body }));
    } catch {
      return send(res, ERRORS.server);
    }
  };
  app.post('/payments/checkout', route('checkout'));
  app.post('/payments/sync', route('sync'));
}
