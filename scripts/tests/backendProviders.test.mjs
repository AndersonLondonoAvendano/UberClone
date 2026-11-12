// AI-assisted: see docs/AI_LOG.md #58
// Plain Node tests for the payment provider registry and adapters (T-135, T-137) and the S2 backend
// wiring (T-138 to T-142). Fakes only: no
// network, no Firebase. Run:
//   node scripts/tests/backendProviders.test.mjs
import assert from 'node:assert/strict';
import { createProviderRegistry } from '../../backend/src/providers/registry.js';
import { createMercadoPagoProvider } from '../../backend/src/providers/mercadopago.js';
import { createStripeProvider } from '../../backend/src/providers/stripe.js';
import { mapPaymentStatus } from '../../backend/src/mercadopago.js';
import { StripeError } from '../../backend/src/stripe.js';
import { createHmac } from 'node:crypto';
import { ConfigError, loadConfig, WARNINGS } from '../../backend/src/config.js';
import { createTripStore } from '../../backend/src/firestore.js';
import { ERRORS } from '../../backend/src/middleware.js';
import { createPaymentsHandlers, registerPaymentsRoutes, registerProvidersRoute } from '../../backend/src/routes/payments.js';
import { RETURN_PAGE, registerReturnRoute } from '../../backend/src/routes/return.js';
import { createStripeWebhookHandler, createWebhookHandler, registerWebhookRoutes } from '../../backend/src/routes/webhooks.js';

// ---------- registry (CA-002-109) ----------
{
  const empty = createProviderRegistry({});
  assert.deepEqual(empty.flags(), { mercadopago: false, stripe: false });
  assert.equal(empty.get('mercadopago'), null);
  assert.equal(empty.isConfigured('stripe'), false);
  assert.deepEqual(createProviderRegistry().flags(), { mercadopago: false, stripe: false });

  const mp = { id: 'mercadopago' };
  const stripe = { id: 'stripe' };
  const one = createProviderRegistry({ mercadopago: mp });
  assert.deepEqual(one.flags(), { mercadopago: true, stripe: false });
  assert.equal(one.get('mercadopago'), mp);
  assert.equal(one.get('stripe'), null);
  assert.equal(one.isConfigured('mercadopago'), true);
  assert.equal(one.isConfigured('stripe'), false);

  const both = createProviderRegistry({ mercadopago: mp, stripe });
  assert.deepEqual(both.flags(), { mercadopago: true, stripe: true });
  assert.equal(both.get('stripe'), stripe);

  // Unknown or odd ids never resolve (no prototype lookups).
  for (const id of ['paypal', '', undefined, null, 42, '__proto__', 'constructor', 'toString']) {
    assert.equal(both.get(id), null);
    assert.equal(both.isConfigured(id), false);
  }
}

// ---------- Mercado Pago adapter (CA-002-109, CA-002-126) ----------
function fakeClient(payment) {
  const calls = [];
  return {
    calls,
    async createPreference(args) { calls.push(['createPreference', args]); return { url: 'https://mp.test/pay' }; },
    async findPaymentByReference(ref) { calls.push(['findPaymentByReference', ref]); return payment; },
  };
}
const trip = { fare: 12_000, status: 'completed', paymentMethod: 'mercadopago' };
const payment = (over = {}) => ({ id: '77', status: 'approved', externalReference: 't1', amount: 12_000, currency: 'COP', ...over });

{
  const client = fakeClient(null);
  const provider = createMercadoPagoProvider({ client });
  assert.equal(provider.id, 'mercadopago');
  const result = await provider.createCheckout({ tripId: 't1', uid: 'u1', trip, currency: 'COP', publicBaseUrl: 'https://example.test' });
  assert.deepEqual(result, { url: 'https://mp.test/pay' });
  assert.deepEqual(client.calls[0], ['createPreference', {
    tripId: 't1', uid: 'u1', amount: 12_000, currency: 'COP', notificationUrl: 'https://example.test/webhooks/mercadopago',
  }]);
}

// getPaymentState returns the same states as mapPaymentStatus.
for (const status of ['approved', 'rejected', 'cancelled', 'pending', 'in_process', 'refunded', undefined, 'weird']) {
  const provider = createMercadoPagoProvider({ client: fakeClient(payment({ status })) });
  const state = await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip, currency: 'COP' });
  assert.deepEqual(state, { status: mapPaymentStatus(status), id: '77' });
}
// No payment, or one that does not match reference, amount or currency: null.
for (const raw of [null, payment({ externalReference: 'other' }), payment({ amount: 1 }), payment({ currency: 'USD' }), payment({ amount: NaN })]) {
  const provider = createMercadoPagoProvider({ client: fakeClient(raw) });
  assert.equal(await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip, currency: 'COP' }), null);
}
// Client errors propagate (the route turns them into a generic upstream error).
{
  const client = { findPaymentByReference: async () => { throw new Error('boom'); } };
  await assert.rejects(createMercadoPagoProvider({ client }).getPaymentState({ tripId: 't1', trip, currency: 'COP' }));
}

// ---------- Stripe adapter (T-137; CA-002-111, CA-002-113, CA-002-115) ----------
const stripeTrip = { fare: 12_000, status: 'completed', paymentMethod: 'stripe' };
const NOW_MS = 1_800_000_000_000;
function fakeStripeClient(session) {
  const calls = [];
  return {
    calls,
    async createCheckoutSession(args) { calls.push(['create', args]); return { id: 'cs_test_FAKE1', url: 'https://checkout.stripe.test/pay' }; },
    async getCheckoutSession(id) { calls.push(['get', id]); return session; },
  };
}
const stripeSession = (over = {}) => ({
  id: 'cs_test_FAKE1', status: 'complete', payment_status: 'paid', client_reference_id: 't1', amount_total: 1_200_000, currency: 'cop', ...over,
});

{
  const client = fakeStripeClient(null);
  const provider = createStripeProvider({ client, currency: 'cop', now: () => NOW_MS });
  assert.equal(provider.id, 'stripe');
  // The amount comes from trip.fare; extra fields (a forged amount) are ignored.
  const result = await provider.createCheckout({
    tripId: 't1', uid: 'u1', trip: stripeTrip, currency: 'COP', publicBaseUrl: 'https://example.test', amount: 1, fare: 1,
  });
  assert.deepEqual(result, { url: 'https://checkout.stripe.test/pay', id: 'cs_test_FAKE1' });
  assert.deepEqual(client.calls[0], ['create', {
    tripId: 't1',
    uid: 'u1',
    amount: 1_200_000,
    currency: 'cop',
    successUrl: 'https://example.test/payments/return',
    cancelUrl: 'https://example.test/payments/return',
    idempotencyKey: `uc-t1-${Math.floor(NOW_MS / 60_000)}`,
  }]);
}
// Idempotency key: stable inside a 60 s bucket, new in the next one.
{
  const keys = [];
  const client = { createCheckoutSession: async (args) => { keys.push(args.idempotencyKey); return { id: 'cs_test_FAKE1', url: 'https://c.test/x' }; } };
  let clock = NOW_MS;
  const provider = createStripeProvider({ client, now: () => clock });
  const args = { tripId: 't1', uid: 'u1', trip: stripeTrip, publicBaseUrl: 'https://example.test' };
  await provider.createCheckout(args);
  clock += 5_000;
  await provider.createCheckout(args);
  clock += 120_000;
  await provider.createCheckout(args);
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[1], keys[2]);
}
// Invalid fares never reach Stripe.
for (const fare of [0, -1, 10.5, undefined, 2_000_001]) {
  const client = fakeStripeClient(null);
  const provider = createStripeProvider({ client });
  await assert.rejects(
    provider.createCheckout({ tripId: 't1', uid: 'u1', trip: { ...stripeTrip, fare }, publicBaseUrl: 'https://example.test' }),
    (error) => error instanceof StripeError && error.status === 400,
  );
  assert.equal(client.calls.length, 0);
}
// usd fallback converts with the operator's rate.
{
  const client = fakeStripeClient(null);
  const provider = createStripeProvider({ client, currency: 'usd', copPerUsd: 4_000 });
  await provider.createCheckout({ tripId: 't1', uid: 'u1', trip: { ...stripeTrip, fare: 20_000 }, publicBaseUrl: 'https://example.test' });
  assert.equal(client.calls[0][1].amount, 500);
  assert.equal(client.calls[0][1].currency, 'usd');
  // usd without a rate: invalid, nothing is sent.
  const noRate = fakeStripeClient(null);
  await assert.rejects(
    createStripeProvider({ client: noRate, currency: 'usd' }).createCheckout({ tripId: 't1', uid: 'u1', trip: stripeTrip, publicBaseUrl: 'https://example.test' }),
    StripeError,
  );
  assert.equal(noRate.calls.length, 0);
}
// Client errors propagate.
{
  const client = { createCheckoutSession: async () => { throw new StripeError(401); } };
  await assert.rejects(
    createStripeProvider({ client }).createCheckout({ tripId: 't1', uid: 'u1', trip: stripeTrip, publicBaseUrl: 'https://example.test' }),
    (error) => error instanceof StripeError && error.status === 401,
  );
}

// getPaymentState: reads the session of trip.paymentId (or an explicit sessionId) and validates it.
{
  const client = fakeStripeClient(stripeSession());
  const provider = createStripeProvider({ client });
  const state = await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip: { ...stripeTrip, paymentId: 'cs_test_FAKE1' } });
  assert.deepEqual(state, { status: 'approved', id: 'cs_test_FAKE1' });
  assert.deepEqual(client.calls[0], ['get', 'cs_test_FAKE1']);
  const viaArg = await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip: stripeTrip, sessionId: 'cs_test_FAKE1' });
  assert.deepEqual(viaArg, { status: 'approved', id: 'cs_test_FAKE1' });
}
for (const [over, expected] of [
  [{ payment_status: 'unpaid', status: 'open' }, 'pending'],
  [{ payment_status: 'unpaid', status: 'expired' }, 'rejected'],
  [{ payment_status: 'unpaid', status: 'open', payment_intent: { last_payment_error: { code: 'card_declined' } } }, 'rejected'],
]) {
  const provider = createStripeProvider({ client: fakeStripeClient(stripeSession(over)) });
  const state = await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip: { ...stripeTrip, paymentId: 'cs_test_FAKE1' } });
  assert.deepEqual(state, { status: expected, id: 'cs_test_FAKE1' });
}
// A session that does not match this trip (reference, amount, currency, id) is null.
for (const over of [{ client_reference_id: 'other' }, { amount_total: 100 }, { currency: 'usd' }, { id: 'cs_test_OTHER' }]) {
  const provider = createStripeProvider({ client: fakeStripeClient(stripeSession(over)) });
  assert.equal(await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip: { ...stripeTrip, paymentId: 'cs_test_FAKE1' } }), null);
}
// No usable session id: null and no network call.
for (const paymentId of [undefined, null, '', 'pi_FAKE', '12345', 'cs_a/b']) {
  const client = fakeStripeClient(stripeSession());
  const provider = createStripeProvider({ client });
  assert.equal(await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip: { ...stripeTrip, paymentId } }), null);
  assert.equal(client.calls.length, 0);
}
// Invalid fare: null and no network call.
{
  const client = fakeStripeClient(stripeSession());
  const provider = createStripeProvider({ client });
  assert.equal(await provider.getPaymentState({ tripId: 't1', uid: 'u1', trip: { ...stripeTrip, fare: 0, paymentId: 'cs_test_FAKE1' } }), null);
  assert.equal(client.calls.length, 0);
}
// Client errors propagate.
{
  const client = { getCheckoutSession: async () => { throw new StripeError(0); } };
  await assert.rejects(
    createStripeProvider({ client }).getPaymentState({ tripId: 't1', trip: { ...stripeTrip, paymentId: 'cs_test_FAKE1' } }),
    StripeError,
  );
}
// The adapter plugs into the registry.
{
  const registry = createProviderRegistry({ stripe: createStripeProvider({ client: fakeStripeClient(null) }) });
  assert.deepEqual(registry.flags(), { mercadopago: false, stripe: true });
  assert.equal(registry.get('stripe').id, 'stripe');
}

// ---------- idempotency key length (verifier note on S1) ----------
{
  const client = fakeStripeClient(null);
  const provider = createStripeProvider({ client, now: () => NOW_MS });
  await assert.rejects(
    provider.createCheckout({ tripId: 'a'.repeat(300), uid: 'u1', trip: stripeTrip, publicBaseUrl: 'https://example.test' }),
    (error) => error instanceof StripeError && error.status === 400,
  );
  assert.equal(client.calls.length, 0);
  await provider.createCheckout({ tripId: 'a'.repeat(128), uid: 'u1', trip: stripeTrip, publicBaseUrl: 'https://example.test' });
  assert.ok(client.calls[0][1].idempotencyKey.length <= 255);
}

// ---------- resolveSession ----------
{
  const session = stripeSession({ metadata: { uid: 'u1', tripId: 't1' } });
  const provider = createStripeProvider({ client: fakeStripeClient(session) });
  assert.deepEqual(await provider.resolveSession('cs_test_FAKE1'), { tripId: 't1', uid: 'u1' });
  assert.equal(await provider.resolveSession('pi_FAKE'), null);
  assert.equal(await createStripeProvider({ client: fakeStripeClient(stripeSession()) }).resolveSession('cs_test_FAKE1'), null);
}

// ---------- config (T-138) ----------
const TEST_KEY = `${['sk', 'test', ''].join('_')}FAKE-SECRET-TOKEN-123`;
const RESTRICTED_KEY = `${['rk', 'test', ''].join('_')}FAKE-SECRET-TOKEN-123`;
const LIVE_KEY = `${['sk', 'live', ''].join('_')}FAKE-SECRET-TOKEN-123`;
const LIVE_RESTRICTED_KEY = `${['rk', 'live', ''].join('_')}FAKE-SECRET-TOKEN-123`;
const baseEnv = { FIREBASE_SERVICE_ACCOUNT_PATH: 'x.json', PUBLIC_BASE_URL: 'https://x.test/' };
{
  assert.throws(() => loadConfig(baseEnv), (e) => e instanceof ConfigError && e.missing.includes('MP_ACCESS_TOKEN'));
  const none = loadConfig(baseEnv, { allowNoProvider: true });
  assert.deepEqual(none.providers, { mercadopago: null, stripe: null });
  assert.deepEqual(none.warnings, []);
  assert.throws(() => loadConfig({}, { allowNoProvider: true }), (e) => e instanceof ConfigError);
  const mp = loadConfig({ ...baseEnv, MP_ACCESS_TOKEN: 'FAKE-SECRET-TOKEN-123', MP_WEBHOOK_SECRET: 'w' });
  assert.equal(mp.providers.mercadopago.accessToken, 'FAKE-SECRET-TOKEN-123');
  assert.equal(mp.providers.stripe, null);
  assert.equal(mp.mpAccessToken, 'FAKE-SECRET-TOKEN-123');
  const only = loadConfig({ ...baseEnv, STRIPE_SECRET_KEY: TEST_KEY }, { allowNoProvider: true });
  assert.deepEqual(only.providers.stripe, { secretKey: TEST_KEY, webhookSecret: null, currency: 'cop', copPerUsd: null });
  const restricted = loadConfig({ ...baseEnv, STRIPE_SECRET_KEY: RESTRICTED_KEY, STRIPE_WEBHOOK_SECRET: 'FAKE-SECRET-TOKEN-123' }, { allowNoProvider: true });
  assert.equal(restricted.providers.stripe.webhookSecret, 'FAKE-SECRET-TOKEN-123');
  for (const [key, warning] of [[LIVE_KEY, WARNINGS.stripeLiveKey], [LIVE_RESTRICTED_KEY, WARNINGS.stripeLiveKey], ['FAKE-SECRET-TOKEN-123', WARNINGS.stripeBadKey]]) {
    const config = loadConfig({ ...baseEnv, MP_ACCESS_TOKEN: 'a', STRIPE_SECRET_KEY: key });
    assert.equal(config.providers.stripe, null);
    assert.notEqual(config.providers.mercadopago, null);
    assert.deepEqual(config.warnings, [warning]);
    assert.ok(!JSON.stringify(config.warnings).includes('FAKE-SECRET-TOKEN-123'));
  }
  const usd = loadConfig({ ...baseEnv, STRIPE_SECRET_KEY: TEST_KEY, STRIPE_CURRENCY: 'USD', STRIPE_COP_PER_USD: '4000' }, { allowNoProvider: true });
  assert.equal(usd.providers.stripe.currency, 'usd');
  assert.equal(usd.providers.stripe.copPerUsd, 4000);
  for (const extra of [{ STRIPE_CURRENCY: 'usd' }, { STRIPE_CURRENCY: 'usd', STRIPE_COP_PER_USD: '0' }, { STRIPE_CURRENCY: 'eur' }]) {
    const config = loadConfig({ ...baseEnv, STRIPE_SECRET_KEY: TEST_KEY, ...extra }, { allowNoProvider: true });
    assert.equal(config.providers.stripe, null);
    assert.deepEqual(config.warnings, [WARNINGS.stripeBadCurrency]);
  }
}

// ---------- store (T-139) ----------
function createFakeDb(initial) {
  const docs = new Map(Object.entries(initial));
  const writes = [];
  const ref = (path) => ({ path, get: async () => ({ exists: docs.has(path), data: () => ({ ...docs.get(path) }) }) });
  return {
    docs,
    writes,
    doc: ref,
    runTransaction: async (fn) => fn({
      get: (r) => r.get(),
      update: (r, data) => { writes.push(data); docs.set(r.path, { ...docs.get(r.path), ...data }); },
    }),
  };
}
const tripPath = (uid, id) => `drivers/${uid}/trips/${id}`;
const CARD_TRIP = { status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending', fare: 12_000 };
{
  const db = createFakeDb({ [tripPath('u1', 't1')]: CARD_TRIP });
  const store = createTripStore(db);
  assert.deepEqual(await store.setPaymentMethod('u1', 't1', 'stripe', { paymentId: 'cs_test_FAKE1' }), { ok: true, applied: true });
  assert.deepEqual(db.docs.get(tripPath('u1', 't1')), { ...CARD_TRIP, paymentMethod: 'stripe', paymentId: 'cs_test_FAKE1' });
  const before = db.writes.length;
  assert.deepEqual(await store.setPaymentMethod('u1', 't1', 'stripe', { paymentId: 'cs_test_FAKE1' }), { ok: true, applied: false });
  assert.equal(db.writes.length, before);
  for (const [uid, id, method] of [['u1', 't1', 'cash'], ['u1', 't1', undefined], ['u1', 'nope', 'stripe'], ['u2', 't1', 'stripe']]) {
    assert.equal((await store.setPaymentMethod(uid, id, method)).ok, false);
  }
  for (const trip of [
    { ...CARD_TRIP, paymentStatus: 'approved' },
    { ...CARD_TRIP, status: 'paid', paymentStatus: 'approved' },
    { ...CARD_TRIP, status: 'in_progress' },
  ]) {
    const frozen = createFakeDb({ [tripPath('u1', 't1')]: trip });
    assert.equal((await createTripStore(frozen).setPaymentMethod('u1', 't1', 'stripe', { paymentId: 'cs_test_FAKE1' })).ok, false);
    assert.deepEqual(frozen.docs.get(tripPath('u1', 't1')), trip);
  }
}
{
  const approved = { status: 'approved', id: 'cs_test_FAKE1' };
  const stripeDb = createFakeDb({ [tripPath('u1', 't1')]: { ...CARD_TRIP, paymentMethod: 'stripe' } });
  const store = createTripStore(stripeDb);
  assert.equal((await store.applyPayment('u1', 't1', approved)).applied, false, 'default provider is mercadopago');
  assert.equal((await store.applyPayment('u1', 't1', approved, 'paypal')).applied, false);
  assert.equal(stripeDb.writes.length, 0);
  assert.equal((await store.applyPayment('u1', 't1', approved, 'stripe')).applied, true);
  assert.equal(stripeDb.docs.get(tripPath('u1', 't1')).status, 'paid');
  assert.equal((await store.applyPayment('u1', 't1', approved, 'stripe')).applied, false);
  const mpDb = createFakeDb({ [tripPath('u1', 't1')]: CARD_TRIP });
  assert.equal((await createTripStore(mpDb).applyPayment('u1', 't1', { status: 'approved', id: 77 }, 'stripe')).applied, false);
  assert.equal((await createTripStore(mpDb).applyPayment('u1', 't1', { status: 'approved', id: 77 })).applied, true);
}

// ---------- handlers (T-140) ----------
const CONFIG = { publicBaseUrl: 'https://example.test', maxAmountCop: 2_000_000, currency: 'COP', providers: { stripe: { webhookSecret: null } } };
function gatewayFakes({ mpPayment = null, session = null } = {}) {
  const log = { mp: [], stripe: [] };
  const mpClient = {
    createPreference: async (args) => { log.mp.push(['create', args]); return { url: 'https://mp.test/pay' }; },
    findPaymentByReference: async (ref) => { log.mp.push(['find', ref]); return mpPayment; },
  };
  const stripeClient = {
    createCheckoutSession: async (args) => { log.stripe.push(['create', args]); return { id: 'cs_test_FAKE1', url: 'https://checkout.stripe.test/pay' }; },
    getCheckoutSession: async (id) => { log.stripe.push(['get', id]); return session; },
  };
  return {
    log,
    mp: createMercadoPagoProvider({ client: mpClient }),
    stripe: createStripeProvider({ client: stripeClient, now: () => NOW_MS }),
  };
}
function setup({ trips, which = ['mercadopago', 'stripe'], ...fakes } = {}) {
  const g = gatewayFakes(fakes);
  const db = createFakeDb(trips ?? { [tripPath('u1', 't1')]: CARD_TRIP });
  const store = createTripStore(db);
  const registry = createProviderRegistry({
    mercadopago: which.includes('mercadopago') ? g.mp : null,
    stripe: which.includes('stripe') ? g.stripe : null,
  });
  return { g, db, store, registry, handlers: createPaymentsHandlers({ store, config: CONFIG, registry }) };
}
{
  for (const [which, expected] of [
    [['mercadopago', 'stripe'], { mercadopago: true, stripe: true }],
    [['mercadopago'], { mercadopago: true, stripe: false }],
    [['stripe'], { mercadopago: false, stripe: true }],
    [[], { mercadopago: false, stripe: false }],
  ]) {
    const result = await setup({ which }).handlers.providers({ uid: 'u1' });
    assert.deepEqual(result, { status: 200, body: expected });
  }
  const none = setup({ which: [] });
  // #59: no provider is invalid; a known gateway without credentials is "provider_not_configured".
  assert.deepEqual(await none.handlers.checkout({ uid: 'u1', body: { tripId: 't1' } }), ERRORS.invalid);
  assert.deepEqual(await none.handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'stripe' } }), { ...ERRORS.providerNotConfigured, provider: 'stripe' });
  assert.deepEqual(await none.handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'mercadopago' } }), { ...ERRORS.providerNotConfigured, provider: 'mercadopago' });
  assert.deepEqual(none.g.log, { mp: [], stripe: [] });
}
{
  const t = setup();
  const hostile = { tripId: 't1', provider: 'stripe', amount: 1, currency: 'USD', fare: 1, paymentMethod: 'cash', uid: 'u2' };
  assert.deepEqual(await t.handlers.checkout({ uid: 'u1', body: hostile }), { status: 200, body: { url: 'https://checkout.stripe.test/pay' }, provider: 'stripe' });
  assert.equal(t.g.log.stripe[0][1].amount, 1_200_000);
  assert.equal(t.g.log.stripe[0][1].uid, 'u1');
  assert.deepEqual(t.g.log.mp, []);
  assert.deepEqual(t.db.docs.get(tripPath('u1', 't1')), { ...CARD_TRIP, paymentMethod: 'stripe', paymentId: 'cs_test_FAKE1' });
  assert.deepEqual(await t.handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'mercadopago', amount: 1 } }), { status: 200, body: { url: 'https://mp.test/pay' }, provider: 'mercadopago' });
  assert.equal(t.g.log.mp[0][1].amount, 12_000);
  assert.equal(t.db.docs.get(tripPath('u1', 't1')).paymentMethod, 'mercadopago');
}
{
  const cases = {
    unknownProvider: [{ tripId: 't1', provider: 'paypal' }, CARD_TRIP],
    objectProvider: [{ tripId: 't1', provider: { x: 1 } }, CARD_TRIP],
    badTripId: [{ tripId: '../x', provider: 'stripe' }, CARD_TRIP],
    cash: [{ tripId: 't1', provider: 'stripe' }, { ...CARD_TRIP, paymentMethod: 'cash' }],
    notCompleted: [{ tripId: 't1', provider: 'stripe' }, { ...CARD_TRIP, status: 'in_progress' }],
    approved: [{ tripId: 't1', provider: 'stripe' }, { ...CARD_TRIP, paymentStatus: 'approved' }],
    zeroFare: [{ tripId: 't1', provider: 'stripe' }, { ...CARD_TRIP, fare: 0 }],
    overCap: [{ tripId: 't1', provider: 'stripe' }, { ...CARD_TRIP, fare: 2_000_001 }],
  };
  for (const [name, [body, trip]] of Object.entries(cases)) {
    const t = setup({ trips: { [tripPath('u1', 't1')]: trip } });
    assert.deepEqual(await t.handlers.checkout({ uid: 'u1', body }), ERRORS.invalid, name);
    assert.deepEqual(t.g.log, { mp: [], stripe: [] }, name);
    assert.deepEqual(t.db.docs.get(tripPath('u1', 't1')), trip, name);
  }
  assert.deepEqual(await setup().handlers.checkout({ uid: 'u2', body: { tripId: 't1', provider: 'stripe' } }), ERRORS.notFound);
  const t = setup();
  t.registry.get('stripe').createCheckout = async () => { throw new StripeError(500); };
  assert.deepEqual(await t.handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'stripe' } }), ERRORS.upstream);
  assert.equal(t.db.docs.get(tripPath('u1', 't1')).paymentMethod, 'mercadopago');
}
{
  const stripeTripDoc = { ...CARD_TRIP, paymentMethod: 'stripe', paymentId: 'cs_test_FAKE1' };
  const t = setup({ trips: { [tripPath('u1', 't1')]: stripeTripDoc }, session: stripeSession() });
  assert.deepEqual(await t.handlers.sync({ uid: 'u1', body: { tripId: 't1', provider: 'mercadopago' } }), { status: 200, body: { paymentStatus: 'approved' }, provider: 'stripe' });
  assert.deepEqual(t.g.log.mp, []);
  assert.deepEqual(t.g.log.stripe, [['get', 'cs_test_FAKE1']]);
  assert.equal(t.db.docs.get(tripPath('u1', 't1')).status, 'paid');
  const mp = setup({ mpPayment: { id: '77', status: 'approved', externalReference: 't1', amount: 12_000, currency: 'COP' } });
  assert.equal((await mp.handlers.sync({ uid: 'u1', body: { tripId: 't1', provider: 'stripe' } })).body.paymentStatus, 'approved');
  assert.deepEqual(mp.g.log.stripe, []);
  const lie = setup({ trips: { [tripPath('u1', 't1')]: stripeTripDoc }, session: stripeSession({ amount_total: 100 }) });
  assert.equal((await lie.handlers.sync({ uid: 'u1', body: { tripId: 't1' } })).body.paymentStatus, 'pending');
  assert.equal(lie.db.writes.length, 0);
  assert.deepEqual(await setup({ trips: { [tripPath('u1', 't1')]: stripeTripDoc }, which: ['mercadopago'] }).handlers.sync({ uid: 'u1', body: { tripId: 't1' } }), ERRORS.invalid);
  assert.deepEqual(await t.handlers.sync({ uid: 'u1', body: { tripId: 'missing' } }), ERRORS.notFound);
}

// ---------- return page and Stripe webhook (T-141, T-142) ----------
function fakeRes() {
  const res = { code: null, payload: null, headers: {}, text: null,
    status(c) { res.code = c; return res; }, json(b) { res.payload = b; return res; },
    set(h) { Object.assign(res.headers, h); return res; }, send(t) { res.text = t; return res; } };
  return res;
}
function fakeRouter() {
  const routes = {};
  const add = (verb) => (path, ...chain) => { routes[`${verb} ${path}`] = chain; };
  const router = { routes, get: add('GET'), post: add('POST') };
  router.call = async (key, req) => {
    const res = fakeRes();
    const chain = routes[key];
    let index = 0;
    const next = async () => { const fn = chain[index++]; await fn(req, res, next); };
    await next();
    return res;
  };
  return router;
}
{
  const router = fakeRouter();
  let allowed = 2;
  registerReturnRoute(router, { ipLimiter: { hit: () => allowed-- > 0 } });
  const plain = await router.call('GET /payments/return', { ip: '1.1.1.1', query: {} });
  const hostile = await router.call('GET /payments/return', { ip: '1.1.1.1', query: { x: '<script>alert(1)</script>' } });
  for (const res of [plain, hostile]) {
    assert.equal(res.code, 200);
    assert.equal(res.text, RETURN_PAGE);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
  assert.ok(!/<script|\$\{/.test(RETURN_PAGE));
  assert.equal((await router.call('GET /payments/return', { ip: '1.1.1.1' })).code, 429);
  const session = fakeStripeClient(null);
  await createStripeProvider({ client: session }).createCheckout({ tripId: 't1', uid: 'u1', trip: stripeTrip, publicBaseUrl: 'https://example.test' });
  assert.equal(session.calls[0][1].successUrl, 'https://example.test/payments/return');
}
{
  const SECRET = 'FAKE-SECRET-TOKEN-123';
  const stripeTripDoc = { ...CARD_TRIP, paymentMethod: 'stripe', paymentId: 'cs_test_FAKE1' };
  const event = (over = {}) => ({ id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: 'cs_test_FAKE1', payment_status: 'paid' } }, ...over });
  const sign = (raw, { secret = SECRET, at = NOW_MS } = {}) => {
    const ts = Math.floor(at / 1000);
    return `t=${ts},v1=${createHmac('sha256', secret).update(`${ts}.${raw}`).digest('hex')}`;
  };
  const hook = (t, { secret = SECRET } = {}) => createStripeWebhookHandler({
    store: t.store,
    registry: t.registry,
    config: { ...CONFIG, providers: { stripe: { webhookSecret: secret } } },
    now: () => NOW_MS,
  });
  const live = () => setup({ trips: { [tripPath('u1', 't1')]: stripeTripDoc }, session: stripeSession({ metadata: { uid: 'u1', tripId: 't1' } }) });
  const call = (handler, raw, header) => handler({ headers: header === undefined ? {} : { 'stripe-signature': header }, rawBody: Buffer.from(raw) });
  const ack = { status: 200, body: { received: true } };
  {
    const t = live();
    const raw = JSON.stringify(event());
    assert.deepEqual(await call(hook(t), raw, sign(raw)), ack);
    assert.equal(t.db.docs.get(tripPath('u1', 't1')).status, 'paid');
  }
  {
    const t = live();
    const raw = JSON.stringify(event());
    const refused = [
      await call(hook(t, { secret: null }), raw, sign(raw)),
      await call(hook(t), raw, undefined),
      await call(hook(t), raw, 'garbage'),
      await call(hook(t), raw + ' ', sign(raw)),
      await call(hook(t), raw, sign(raw, { at: NOW_MS - 6 * 60_000 })),
      await call(hook(t), raw, sign(raw, { secret: 'other' })),
      await hook(t)({ headers: { 'stripe-signature': sign(raw) }, rawBody: { type: 'x' } }),
    ];
    for (const result of refused) assert.deepEqual(result, ERRORS.unauthorized);
    assert.deepEqual(t.g.log.stripe, []);
    assert.equal(t.db.writes.length, 0);
  }
  {
    const t = setup({ trips: { [tripPath('u1', 't1')]: stripeTripDoc }, session: stripeSession({ payment_status: 'unpaid', status: 'open', metadata: { uid: 'u1', tripId: 't1' } }) });
    const raw = JSON.stringify(event({ data: { object: { id: 'cs_test_FAKE1', payment_status: 'paid', metadata: { uid: 'u1' } } } }));
    assert.deepEqual(await call(hook(t), raw, sign(raw)), ack);
    assert.notEqual(t.db.docs.get(tripPath('u1', 't1')).status, 'paid');
  }
  for (const [over, trips] of [
    [{ type: 'payment_intent.succeeded' }, undefined],
    [{ data: { object: { id: 'pi_FAKE' } } }, undefined],
    [{ data: {} }, undefined],
    [{}, { [tripPath('u1', 't1')]: { ...stripeTripDoc, paymentMethod: 'mercadopago' } }],
    [{}, { [tripPath('u9', 'other')]: stripeTripDoc }],
  ]) {
    const t = setup({ trips: trips ?? { [tripPath('u1', 't1')]: stripeTripDoc }, session: stripeSession({ metadata: { uid: 'u1', tripId: 't1' } }) });
    const raw = JSON.stringify(event(over));
    assert.deepEqual(await call(hook(t), raw, sign(raw)), ack);
    assert.equal(t.db.writes.length, 0);
  }
  {
    const t = live();
    assert.deepEqual(await call(hook(t), 'not json', sign('not json')), ERRORS.invalid);
    const raw = JSON.stringify(event());
    t.registry.get('stripe').resolveSession = async () => { throw new StripeError(500); };
    assert.deepEqual(await call(hook(t), raw, sign(raw)), ERRORS.upstream);
    t.registry.get('stripe').resolveSession = async () => { throw new StripeError(404); };
    assert.deepEqual(await call(hook(t), raw, sign(raw)), ack);
  }
  {
    const router = fakeRouter();
    const order = [];
    registerWebhookRoutes(router, {
      stripeHandler: async ({ rawBody }) => { order.push('handler'); return { status: 200, body: { got: Buffer.isBuffer(rawBody) } }; },
      rawParser: (req, res, next) => { order.push('raw'); req.body = Buffer.from('x'); return next(); },
      ipLimiter: { hit: () => { order.push('limit'); return true; } },
    });
    assert.equal(router.routes['POST /webhooks/mercadopago'], undefined);
    const res = await router.call('POST /webhooks/stripe', { headers: {}, ip: '1.1.1.1' });
    assert.deepEqual(order, ['limit', 'raw', 'handler']);
    assert.deepEqual(res.payload, { got: true });
    const limited = fakeRouter();
    registerWebhookRoutes(limited, { stripeHandler: async () => ERRORS.server, ipLimiter: { hit: () => false } });
    assert.equal((await limited.call('POST /webhooks/stripe', { headers: {}, ip: '1.1.1.1' })).code, 429);
    const both = fakeRouter();
    registerWebhookRoutes(both, { handler: async () => ack, ipLimiter: { hit: () => true } });
    assert.ok(both.routes['POST /webhooks/mercadopago']);
    assert.equal(both.routes['POST /webhooks/stripe'], undefined);
    assert.equal(typeof createWebhookHandler, 'function');
    assert.equal(typeof registerPaymentsRoutes, 'function');
    assert.equal(typeof registerProvidersRoute, 'function');
  }
}

console.log('backendProviders tests passed');
