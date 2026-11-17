// AI-assisted: see AI_LOG.md #58
// Payment provider registry. A provider is
//   { id, createCheckout({ tripId, uid, trip, currency, publicBaseUrl }) -> { url },
//     getPaymentState({ tripId, uid, trip, currency }) -> { status: approved | pending | rejected, id } | null }
// where null means "no payment corresponds to this trip". Missing providers are simply not configured.
const PROVIDER_IDS = ['mercadopago', 'stripe'];

export function createProviderRegistry({ mercadopago = null, stripe = null } = {}) {
  const providers = { mercadopago: mercadopago ?? null, stripe: stripe ?? null };

  const isKnown = (id) => typeof id === 'string' && PROVIDER_IDS.includes(id);

  return {
    isKnown,
    // Returns the provider, or null for unknown ids and providers that are not configured.
    get(id) {
      return isKnown(id) ? providers[id] : null;
    },
    isConfigured(id) {
      return isKnown(id) && providers[id] !== null;
    },
    // Booleans only: safe to send to the app (never keys or URLs).
    flags() {
      return { mercadopago: providers.mercadopago !== null, stripe: providers.stripe !== null };
    },
  };
}
