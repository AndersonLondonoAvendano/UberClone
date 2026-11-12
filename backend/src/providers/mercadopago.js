// AI-assisted: see docs/AI_LOG.md #58
// Mercado Pago adapter for the provider interface. Wraps createMercadoPagoClient without changing
// its behavior: same reference (the trip id), same notification URL and same status mapping.
// AI-assisted: see docs/AI_LOG.md #61 (amount = fare + tip via chargeAmount)
import { chargeAmount } from '../chargeAmount.js';
import { mapPaymentStatus, paymentMatchesTrip } from '../mercadopago.js';

export function createMercadoPagoProvider({ client }) {
  return {
    id: 'mercadopago',

    // The amount always comes from trip.fare, never from a caller-supplied value.
    async createCheckout({ tripId, uid, trip, currency, publicBaseUrl }) {
      const { url } = await client.createPreference({
        tripId,
        uid,
        amount: chargeAmount(trip),
        currency,
        notificationUrl: `${publicBaseUrl}/webhooks/mercadopago`,
      });
      return { url };
    },

    // null when there is no payment, or it does not match the trip (reference, amount, currency).
    async getPaymentState({ tripId, trip, currency }) {
      const payment = await client.findPaymentByReference(tripId);
      if (!payment || !paymentMatchesTrip(payment, tripId, trip, currency)) return null;
      return { status: mapPaymentStatus(payment.status), id: payment.id };
    },
  };
}
