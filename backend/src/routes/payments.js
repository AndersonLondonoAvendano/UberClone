// AI-assisted: see AI_LOG.md #58
// GET /payments/providers, POST /payments/checkout and POST /payments/sync. The amount always comes
// from the trip document; anything else in the body is ignored. The gateway is a provider from the
// registry; without one (R8 callers) Mercado Pago is built from the injected mp client.
import { chargeAmount } from '../chargeAmount.js';
import { ERRORS, send as defaultSend } from '../middleware.js';
import { createMercadoPagoProvider } from '../providers/mercadopago.js';
import { createProviderRegistry } from '../providers/registry.js';

const TRIP_ID = /^[A-Za-z0-9_-]{1,128}$/;
const CARD_METHODS = ['mercadopago', 'stripe'];

export function validTripId(value) {
  return typeof value === 'string' && TRIP_ID.test(value);
}

// AI-assisted: see AI_LOG.md #61 (the charged amount is fare + tip, from the trip document)
function validAmount(trip, maxAmount) {
  const amount = chargeAmount(trip);
  return Number.isInteger(amount) && amount > 0 && amount <= maxAmount;
}

export function createPaymentsHandlers({ store, mp, config, registry }) {
  const providers = registry ?? createProviderRegistry({ mercadopago: mp ? createMercadoPagoProvider({ client: mp }) : null });

  return {
    // Booleans only: never keys, URLs or variable names.
    async providers() {
      return { status: 200, body: providers.flags() };
    },

    async checkout({ uid, body }) {
      const tripId = body?.tripId;
      if (!validTripId(tripId)) return ERRORS.invalid;
      // The provider is required and is the gateway the driver pressed (#59): never a default.
      const providerId = body?.provider;
      if (!providers.isKnown(providerId)) return ERRORS.invalid;
      const provider = providers.get(providerId);
      if (!provider) return { ...ERRORS.providerNotConfigured, provider: providerId };
      const trip = await store.getTrip(uid, tripId);
      if (!trip) return ERRORS.notFound;
      if (trip.status !== 'completed' || !CARD_METHODS.includes(trip.paymentMethod) || trip.paymentStatus === 'approved') {
        return ERRORS.invalid;
      }
      if (!validAmount(trip, config.maxAmountCop)) return ERRORS.invalid;
      let checkout;
      try {
        checkout = await provider.createCheckout({
          tripId,
          uid,
          trip,
          currency: config.currency,
          publicBaseUrl: config.publicBaseUrl,
        });
      } catch {
        return ERRORS.upstream;
      }
      // The method (and the session id, so sync can read it before any webhook) is saved only after
      // the session exists; if saving is refused (for example the trip was approved meanwhile) no URL is given.
      try {
        const saved = await store.setPaymentMethod(uid, tripId, provider.id, { paymentId: checkout.id });
        if (!saved.ok) return ERRORS.invalid;
      } catch {
        return ERRORS.server;
      }
      return { status: 200, body: { url: checkout.url }, provider: provider.id };
    },

    // The gateway is the one recorded in trip.paymentMethod; a provider in the body is ignored.
    async sync({ uid, body }) {
      const tripId = body?.tripId;
      if (!validTripId(tripId)) return ERRORS.invalid;
      const trip = await store.getTrip(uid, tripId);
      if (!trip) return ERRORS.notFound;
      if (!CARD_METHODS.includes(trip.paymentMethod) || (trip.status !== 'completed' && trip.status !== 'paid')) {
        return ERRORS.invalid;
      }
      const provider = providers.get(trip.paymentMethod);
      if (!provider) return ERRORS.invalid;
      if (trip.paymentStatus === 'approved') return { status: 200, body: { paymentStatus: 'approved' } };
      try {
        const state = await provider.getPaymentState({ tripId, uid, trip, currency: config.currency });
        if (!state) return { status: 200, body: { paymentStatus: trip.paymentStatus ?? 'pending' } };
        const result = await store.applyPayment(uid, tripId, state, provider.id);
        return { status: 200, body: { paymentStatus: result.paymentStatus ?? trip.paymentStatus ?? 'pending' }, provider: provider.id };
      } catch {
        return ERRORS.upstream;
      }
    },
  };
}

// send(res, result) writes { status, body }; any thrown error becomes a generic 500.
// GET /payments/providers needs a router with get(); it is registered separately so callers with a
// post-only router (the R8 tests) keep working.
export function registerProvidersRoute(app, { guard, handlers, send = defaultSend }) {
  app.get('/payments/providers', async (req, res) => {
    try {
      const guarded = await guard({ authorization: req.headers?.authorization, ip: req.ip });
      if (!guarded.uid) return send(res, guarded);
      return send(res, await handlers.providers({ uid: guarded.uid }));
    } catch {
      return send(res, ERRORS.server);
    }
  });
}

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
