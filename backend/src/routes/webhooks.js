// AI-assisted: see docs/AI_LOG.md #55
// POST /webhooks/mercadopago. The body is never trusted: only the payment id is used, and the
// payment is fetched from Mercado Pago with the server token and checked against the trip document.
import { ERRORS, send as defaultSend } from '../middleware.js';
import { mapPaymentStatus, paymentMatchesTrip } from '../mercadopago.js';
import { validTripId } from './payments.js';

const PAYMENT_ID = /^\d{1,20}$/;
const RECEIVED = { status: 200, body: { received: true } };

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

export function createWebhookHandler({ store, mp, config }) {
  return async function handleWebhook({ query, headers, body }) {
    const queryDataId = first(query?.['data.id']);
    const dataId = queryDataId ?? first(query?.id) ?? body?.data?.id;

    if (config.webhookSecret) {
      const valid = mp.verifySignature({ headers, dataId: queryDataId, secret: config.webhookSecret });
      if (!valid) return ERRORS.unauthorized;
    }

    const type = first(query?.type) ?? first(query?.topic) ?? body?.type;
    if (type !== undefined && type !== 'payment') return RECEIVED;

    const paymentId = dataId === undefined || dataId === null ? '' : String(dataId);
    if (!PAYMENT_ID.test(paymentId)) return ERRORS.invalid;

    let payment;
    try {
      payment = await mp.getPayment(paymentId);
    } catch (error) {
      // An unknown payment id will never resolve: acknowledge it. Anything else: let Mercado Pago retry.
      return error?.status === 404 ? RECEIVED : ERRORS.upstream;
    }

    const tripId = payment.externalReference;
    if (!payment.uid || !validTripId(tripId)) return RECEIVED;

    try {
      const trip = await store.getTrip(payment.uid, tripId);
      if (!trip || trip.paymentMethod !== 'mercadopago') return RECEIVED;
      if (!paymentMatchesTrip(payment, tripId, trip, config.currency)) return RECEIVED;
      await store.applyPayment(payment.uid, tripId, {
        status: mapPaymentStatus(payment.status),
        id: payment.id,
      });
      return RECEIVED;
    } catch {
      return ERRORS.server;
    }
  };
}

export function registerWebhookRoutes(app, { handler, ipLimiter, send = defaultSend }) {
  app.post('/webhooks/mercadopago', async (req, res) => {
    try {
      if (!ipLimiter.hit(`webhook:${req.ip ?? 'unknown'}`)) return send(res, ERRORS.rateLimited);
      return send(res, await handler({ query: req.query, headers: req.headers, body: req.body }));
    } catch {
      return send(res, ERRORS.server);
    }
  });
}
