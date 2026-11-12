// AI-assisted: see docs/AI_LOG.md #58
// POST /webhooks/mercadopago. The body is never trusted: only the payment id is used, and the
// payment is fetched from Mercado Pago with the server token and checked against the trip document.
import { ERRORS, send as defaultSend } from '../middleware.js';
import { mapPaymentStatus, paymentMatchesTrip } from '../mercadopago.js';
import { isStripeSessionId, verifyStripeSignature } from '../stripe.js';
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

// POST /webhooks/stripe. rawBody is the untouched Buffer (the signature covers the exact bytes). Without
// STRIPE_WEBHOOK_SECRET nothing is applied. The event body is never trusted beyond the session id:
// the session is read again from Stripe and checked against the trip document, as sync does.
export function createStripeWebhookHandler({ store, registry, config, now = Date.now }) {
  return async function handleStripeWebhook({ headers, rawBody }) {
    const secret = config.providers?.stripe?.webhookSecret;
    const header = headers?.['stripe-signature'];
    if (!secret || !verifyStripeSignature({ rawBody, header, secret, now: now() })) return ERRORS.unauthorized;

    let event;
    try {
      event = JSON.parse(Buffer.from(rawBody).toString('utf8'));
    } catch {
      return ERRORS.invalid;
    }
    if (typeof event?.type !== 'string' || !event.type.startsWith('checkout.session.')) return RECEIVED;
    const sessionId = event?.data?.object?.id;
    if (!isStripeSessionId(sessionId)) return RECEIVED;

    const provider = registry.get('stripe');
    if (!provider) return RECEIVED;
    try {
      const reference = await provider.resolveSession(sessionId);
      if (!reference || !validTripId(reference.tripId)) return RECEIVED;
      const trip = await store.getTrip(reference.uid, reference.tripId);
      if (!trip || trip.paymentMethod !== 'stripe') return RECEIVED;
      const state = await provider.getPaymentState({
        tripId: reference.tripId,
        uid: reference.uid,
        trip,
        currency: config.currency,
        sessionId,
      });
      if (state) await store.applyPayment(reference.uid, reference.tripId, state, 'stripe');
      return RECEIVED;
    } catch (error) {
      // An unknown session will never resolve: acknowledge it. Anything else: let Stripe retry.
      return error?.status === 404 ? RECEIVED : ERRORS.upstream;
    }
  };
}

// handler (Mercado Pago) and stripeHandler are optional: a gateway that is not configured has no route.
// rawParser is express.raw(...) for the Stripe route, injected by app.js.
export function registerWebhookRoutes(app, { handler, stripeHandler, rawParser, ipLimiter, send = defaultSend }) {
  if (handler) {
    app.post('/webhooks/mercadopago', async (req, res) => {
      try {
        if (!ipLimiter.hit(`webhook:${req.ip ?? 'unknown'}`)) return send(res, ERRORS.rateLimited);
        return send(res, await handler({ query: req.query, headers: req.headers, body: req.body }));
      } catch {
        return send(res, ERRORS.server);
      }
    });
  }
  if (stripeHandler) {
    // The IP limit runs before the body is read.
    const limit = (req, res, next) =>
      ipLimiter.hit(`webhook-stripe:${req.ip ?? 'unknown'}`) ? next() : send(res, ERRORS.rateLimited);
    app.post('/webhooks/stripe', limit, rawParser ?? ((req, res, next) => next()), async (req, res) => {
      try {
        return send(res, await stripeHandler({ headers: req.headers, rawBody: req.body }));
      } catch {
        return send(res, ERRORS.server);
      }
    });
  }
}
