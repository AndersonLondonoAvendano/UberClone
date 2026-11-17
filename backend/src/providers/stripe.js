// AI-assisted: see AI_LOG.md #58
// Stripe adapter for the provider interface. The amount is the trip's fare plus tip, read from
// Firestore (never from the request body); whatever the caller sends is never used. A session that does not match the trip (reference, amount, currency)
// is treated as "no payment for this trip" (null).
// AI-assisted: see AI_LOG.md #61 (amount = fare + tip via chargeAmount)
import { chargeAmount } from '../chargeAmount.js';
import { isStripeSessionId, mapStripeSession, StripeError, toStripeUnitAmount } from '../stripe.js';

const IDEMPOTENCY_BUCKET_MS = 60_000;
const MAX_IDEMPOTENCY_KEY_LENGTH = 255;

// stripeConfig = { currency, copPerUsd } as built by the configuration; maxAmountCop caps the fare.
export function createStripeProvider({ client, currency = 'cop', copPerUsd, maxAmountCop, now = Date.now }) {
  const amountOptions = { currency, copPerUsd, ...(maxAmountCop === undefined ? {} : { maxAmountCop }) };

  return {
    id: 'stripe',

    // Returns { url, id }; id is the Checkout Session id (cs_...), which the caller can persist so the
    // state can be read later. The Idempotency-Key makes a double tap reuse the same session inside the
    // same minute, while a later retry creates a new one.
    async createCheckout({ tripId, uid, trip, publicBaseUrl }) {
      const converted = toStripeUnitAmount(chargeAmount(trip), amountOptions);
      if (converted === null) throw new StripeError(400);
      const returnUrl = `${publicBaseUrl}/payments/return`;
      const idempotencyKey = `uc-${tripId}-${Math.floor(now() / IDEMPOTENCY_BUCKET_MS)}`;
      // Stripe rejects Idempotency-Keys over 255 characters: refuse instead of sending a bad request.
      if (idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH) throw new StripeError(400);
      const session = await client.createCheckoutSession({
        tripId,
        uid,
        amount: converted.amount,
        currency: converted.currency,
        successUrl: returnUrl,
        cancelUrl: returnUrl,
        idempotencyKey,
      });
      return { url: session.url, id: session.id };
    },

    // Reads a session by id and returns the trip it claims to belong to ({ tripId, uid }), or null.
    // Used by the webhook to find the trip; the state is still validated later by getPaymentState.
    async resolveSession(sessionId) {
      if (!isStripeSessionId(sessionId)) return null;
      const session = await client.getCheckoutSession(sessionId);
      const tripId = session?.client_reference_id;
      const uid = session?.metadata?.uid;
      if (typeof tripId !== 'string' || typeof uid !== 'string' || tripId === '' || uid === '') return null;
      return { tripId, uid };
    },

    // The session id comes from the caller (sessionId, for example from a webhook) or from
    // trip.paymentId. Without a valid id there is nothing to read: null.
    async getPaymentState({ tripId, trip, sessionId }) {
      const id = sessionId ?? trip.paymentId;
      if (!isStripeSessionId(id)) return null;
      const converted = toStripeUnitAmount(chargeAmount(trip), amountOptions);
      if (converted === null) return null;
      const session = await client.getCheckoutSession(id);
      const mapped = mapStripeSession(session, {
        tripId,
        expectedAmount: converted.amount,
        expectedCurrency: converted.currency,
      });
      if (!mapped.matches || mapped.id !== id) return null;
      return { status: mapped.status, id: mapped.id };
    },
  };
}
