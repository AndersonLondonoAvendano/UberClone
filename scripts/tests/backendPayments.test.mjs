// AI-assisted: see docs/AI_LOG.md #55
// Plain Node tests for the payments backend with fake Firestore, auth and Mercado Pago (no network,
// no express, no firebase-admin). Covers CA-002-61 to CA-002-67. Run:
//   node scripts/tests/backendPayments.test.mjs
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createAuth } from '../../backend/src/auth.js';
import { ConfigError, loadConfig } from '../../backend/src/config.js';
import { createTripStore } from '../../backend/src/firestore.js';
import { createGuard, createRateLimiter, send } from '../../backend/src/middleware.js';
import {
  createMercadoPagoClient,
  mapPaymentStatus,
  verifySignature,
} from '../../backend/src/mercadopago.js';
import { createPaymentsHandlers, registerPaymentsRoutes } from '../../backend/src/routes/payments.js';
import { createWebhookHandler, registerWebhookRoutes } from '../../backend/src/routes/webhooks.js';

const SECRET = 'test-webhook-secret';
const config = {
  mpAccessToken: 'TEST-TOKEN-NOT-REAL',
  publicBaseUrl: 'https://example.test',
  webhookSecret: null,
  maxAmountCop: 2_000_000,
  currency: 'COP',
};

// ---------- fakes ----------
function createFakeDb(initial) {
  const docs = new Map(Object.entries(initial));
  const ref = (path) => ({
    path,
    get: async () => ({ exists: docs.has(path), data: () => ({ ...docs.get(path) }) }),
  });
  return {
    docs,
    doc: ref,
    runTransaction: async (fn) =>
      fn({
        get: (r) => r.get(),
        update: (r, data) => docs.set(r.path, { ...docs.get(r.path), ...data }),
      }),
  };
}

const TRIP = { status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'pending', fare: 12000 };
const path = (uid, id) => `drivers/${uid}/trips/${id}`;

function fakeAdminAuth() {
  return {
    verifyIdToken: async (token) => {
      if (token === 'good-u1') return { uid: 'u1' };
      if (token === 'good-u2') return { uid: 'u2' };
      throw new Error('bad token');
    },
  };
}

function fakeMp(overrides = {}) {
  const calls = { preferences: [], payments: [], searches: [] };
  const mp = {
    calls,
    payment: null,
    createPreference: async (args) => {
      calls.preferences.push(args);
      return { url: 'https://pay.example/checkout' };
    },
    getPayment: async (id) => {
      calls.payments.push(id);
      if (!mp.payment) throw Object.assign(new Error('x'), { status: 404 });
      return mp.payment;
    },
    findPaymentByReference: async (id) => {
      calls.searches.push(id);
      return mp.payment;
    },
    verifySignature,
    ...overrides,
  };
  return mp;
}

function payment(overrides = {}) {
  return {
    id: '1001',
    status: 'approved',
    mappedStatus: 'approved',
    externalReference: 't1',
    amount: 12000,
    currency: 'COP',
    uid: 'u1',
    ...overrides,
  };
}

function build(trips = { [path('u1', 't1')]: TRIP }, mpOverrides, cfg = config) {
  const db = createFakeDb(trips);
  const store = createTripStore(db);
  const mp = fakeMp(mpOverrides);
  return { db, store, mp, handlers: createPaymentsHandlers({ store, mp, config: cfg }), webhook: createWebhookHandler({ store, mp, config: cfg }) };
}

// ---------- CA-002-65 mapping ----------
for (const [input, expected] of [
  ['approved', 'approved'],
  ['pending', 'pending'],
  ['in_process', 'pending'],
  ['rejected', 'rejected'],
  ['cancelled', 'rejected'],
  ['refunded', 'pending'],
  [undefined, 'pending'],
  ['something_new', 'pending'],
]) {
  assert.equal(mapPaymentStatus(input), expected, String(input));
}

// ---------- config (CA-002-67) ----------
assert.throws(() => loadConfig({}), (e) => e instanceof ConfigError && e.missing.includes('MP_ACCESS_TOKEN'));
const cfgOk = loadConfig({ MP_ACCESS_TOKEN: 'a', FIREBASE_SERVICE_ACCOUNT_PATH: 'b', PUBLIC_BASE_URL: 'https://x.test/' });
assert.equal(cfgOk.port, 3001);
assert.equal(cfgOk.publicBaseUrl, 'https://x.test');
assert.equal(cfgOk.webhookSecret, null);
try {
  loadConfig({ MP_ACCESS_TOKEN: 'secret-value-123', FIREBASE_SERVICE_ACCOUNT_PATH: '', PUBLIC_BASE_URL: 'https://x.test' });
} catch (e) {
  assert.ok(!e.message.includes('secret-value-123'), 'error must not echo values');
}
assert.throws(() => loadConfig({ MP_ACCESS_TOKEN: 'a', FIREBASE_SERVICE_ACCOUNT_PATH: 'b', PUBLIC_BASE_URL: 'https://x.test', PORT: 'abc' }));

// ---------- auth ----------
const auth = createAuth(fakeAdminAuth());
assert.equal(await auth.verifyToken('Bearer good-u1'), 'u1');
for (const header of [undefined, '', 'Bearer', 'Basic good-u1', 'Bearer bad', 'Bearer a b']) {
  await assert.rejects(() => auth.verifyToken(header), { name: 'AuthError' });
}

// ---------- checkout table (CA-002-61, 62) ----------
{
  const { handlers, mp } = build();
  const ok = await handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'mercadopago', amount: 1, title: 'hack' } });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.body, { url: 'https://pay.example/checkout' });
  assert.equal(mp.calls.preferences.length, 1);
  assert.equal(mp.calls.preferences[0].amount, 12000, 'amount comes from the document');
  assert.equal(mp.calls.preferences[0].tripId, 't1');
  assert.equal(mp.calls.preferences[0].currency, 'COP');
  assert.equal(mp.calls.preferences[0].notificationUrl, 'https://example.test/webhooks/mercadopago');
}
const checkoutCases = [
  ['other driver trip', { [path('u2', 't1')]: TRIP }, 'u1', 't1', 404],
  ['missing trip', {}, 'u1', 't1', 404],
  ['not completed', { [path('u1', 't1')]: { ...TRIP, status: 'cancelled' } }, 'u1', 't1', 400],
  ['cash', { [path('u1', 't1')]: { ...TRIP, paymentMethod: 'cash' } }, 'u1', 't1', 400],
  ['already approved', { [path('u1', 't1')]: { ...TRIP, paymentStatus: 'approved' } }, 'u1', 't1', 400],
  ['zero', { [path('u1', 't1')]: { ...TRIP, fare: 0 } }, 'u1', 't1', 400],
  ['negative', { [path('u1', 't1')]: { ...TRIP, fare: -5 } }, 'u1', 't1', 400],
  ['over cap', { [path('u1', 't1')]: { ...TRIP, fare: 2_000_001 } }, 'u1', 't1', 400],
  ['non integer', { [path('u1', 't1')]: { ...TRIP, fare: 100.5 } }, 'u1', 't1', 400],
  ['bad id', { [path('u1', 't1')]: TRIP }, 'u1', '../x', 400],
  ['no id', { [path('u1', 't1')]: TRIP }, 'u1', undefined, 400],
];
for (const [name, trips, uid, tripId, status] of checkoutCases) {
  const { handlers, mp } = build(trips);
  const result = await handlers.checkout({ uid, body: { tripId, provider: 'mercadopago' } });
  assert.equal(result.status, status, name);
  assert.equal(mp.calls.preferences.length, 0, `${name}: no preference`);
  assert.ok(!('url' in result.body), name);
}
{
  const { handlers } = build(undefined, { createPreference: async () => { throw new Error('boom'); } });
  assert.equal((await handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider: 'mercadopago' } })).status, 502);
}
// #59: the provider is required (no default gateway); an unknown id is invalid_request.
{
  const { handlers, mp } = build();
  for (const provider of [undefined, null, '', 'paypal', 5]) {
    const result = await handlers.checkout({ uid: 'u1', body: { tripId: 't1', provider } });
    assert.deepEqual(result.body, { error: 'invalid_request' }, String(provider));
  }
  assert.equal(mp.calls.preferences.length, 0);
}

// ---------- store transaction: idempotent, never regresses (CA-002-64) ----------
{
  const { db, store } = build();
  const key = path('u1', 't1');
  assert.equal((await store.applyPayment('u1', 't1', { status: 'rejected', id: '1' })).applied, true);
  assert.equal(db.docs.get(key).paymentStatus, 'rejected');
  assert.equal((await store.applyPayment('u1', 't1', { status: 'rejected', id: '1' })).applied, false, 'duplicate');
  await store.applyPayment('u1', 't1', { status: 'approved', id: '2' });
  assert.deepEqual(
    { s: db.docs.get(key).status, p: db.docs.get(key).paymentStatus, id: db.docs.get(key).paymentId },
    { s: 'paid', p: 'approved', id: '2' },
  );
  for (const status of ['rejected', 'pending', 'approved']) {
    const r = await store.applyPayment('u1', 't1', { status, id: '3' });
    assert.equal(r.applied, false);
    assert.equal(r.paymentStatus, 'approved');
  }
  assert.equal(db.docs.get(key).paymentId, '2', 'never rewritten after approved');
  assert.equal((await store.applyPayment('u1', 'nope', { status: 'approved', id: '9' })).applied, false);
  assert.equal((await store.applyPayment('u1', 't1', { status: 'weird', id: '9' })).applied, false);
  // Only the three allowed fields may change.
  assert.equal(db.docs.get(key).fare, 12000);
}
{
  const { db, store } = build({ [path('u1', 'c')]: { ...TRIP, paymentMethod: 'cash' } });
  assert.equal((await store.applyPayment('u1', 'c', { status: 'approved', id: '1' })).applied, false);
  assert.equal(db.docs.get(path('u1', 'c')).paymentStatus, 'pending');
}

// ---------- sync ----------
{
  const t = build();
  t.mp.payment = payment({ status: 'approved' });
  const first = await t.handlers.sync({ uid: 'u1', body: { tripId: 't1' } });
  assert.deepEqual(first.body, { paymentStatus: 'approved' });
  const second = await t.handlers.sync({ uid: 'u1', body: { tripId: 't1' } });
  assert.deepEqual(second.body, { paymentStatus: 'approved' });
  t.mp.payment = payment({ status: 'rejected' });
  assert.deepEqual((await t.handlers.sync({ uid: 'u1', body: { tripId: 't1' } })).body, { paymentStatus: 'approved' });
  assert.equal(t.db.docs.get(path('u1', 't1')).paymentStatus, 'approved');
  assert.equal((await t.handlers.sync({ uid: 'u2', body: { tripId: 't1' } })).status, 404, 'other driver');
}
{
  const t = build();
  t.mp.payment = payment({ amount: 1 });
  assert.deepEqual((await t.handlers.sync({ uid: 'u1', body: { tripId: 't1' } })).body, { paymentStatus: 'pending' });
  assert.equal(t.db.docs.get(path('u1', 't1')).paymentStatus, 'pending', 'wrong amount not applied');
  t.mp.payment = null;
  assert.equal((await t.handlers.sync({ uid: 'u1', body: { tripId: 't1' } })).status, 200);
  t.mp.payment = payment({ status: 'in_process' });
  assert.deepEqual((await t.handlers.sync({ uid: 'u1', body: { tripId: 't1' } })).body, { paymentStatus: 'pending' });
}

// ---------- webhook (CA-002-63, 64) ----------
const hookQuery = { 'data.id': '1001', type: 'payment' };
{
  const t = build();
  t.mp.payment = payment();
  const r = await t.webhook({ query: hookQuery, headers: {}, body: { data: { id: '999' }, status: 'approved' } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { received: true });
  assert.deepEqual(t.mp.calls.payments, ['1001'], 'queried by id from the query, body ignored');
  assert.equal(t.db.docs.get(path('u1', 't1')).paymentStatus, 'approved');
  // duplicate, then late rejected after approved
  await t.webhook({ query: hookQuery, headers: {}, body: {} });
  t.mp.payment = payment({ status: 'rejected', id: '1002' });
  await t.webhook({ query: { 'data.id': '1002', type: 'payment' }, headers: {}, body: {} });
  assert.equal(t.db.docs.get(path('u1', 't1')).paymentStatus, 'approved');
  assert.equal(t.db.docs.get(path('u1', 't1')).paymentId, '1001');
}
for (const [name, p] of [
  ['foreign trip id', payment({ externalReference: 'other' })],
  ['different amount', payment({ amount: 5 })],
  ['different currency', payment({ currency: 'USD' })],
  ['no reference', payment({ externalReference: null })],
  ['no uid', payment({ uid: null })],
  ['other uid', payment({ uid: 'u2' })],
]) {
  const t = build();
  t.mp.payment = p;
  const r = await t.webhook({ query: hookQuery, headers: {}, body: {} });
  assert.equal(r.status, 200, name);
  assert.deepEqual(r.body, { received: true }, name);
  assert.equal(t.db.docs.get(path('u1', 't1')).paymentStatus, 'pending', `${name}: nothing applied`);
}
{
  const t = build();
  // unknown payment: acknowledged; non payment topic ignored; bad id rejected
  assert.equal((await t.webhook({ query: hookQuery, headers: {}, body: {} })).status, 200);
  assert.equal((await t.webhook({ query: { 'data.id': '1', type: 'merchant_order' }, headers: {}, body: {} })).status, 200);
  assert.equal(t.mp.calls.payments.length, 1);
  assert.equal((await t.webhook({ query: { 'data.id': 'abc', type: 'payment' }, headers: {}, body: {} })).status, 400);
}
{
  const t = build(undefined, { getPayment: async () => { throw Object.assign(new Error('x'), { status: 500 }); } });
  assert.equal((await t.webhook({ query: hookQuery, headers: {}, body: {} })).status, 502, 'MP outage: retry');
}

// ---------- signature ----------
function sign({ dataId = '1001', requestId = 'req-1', ts = Date.now(), secret = SECRET }) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac('sha256', secret).update(manifest).digest('hex');
  return { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId };
}
assert.equal(verifySignature({ headers: sign({}), dataId: '1001', secret: SECRET }), true);
assert.equal(verifySignature({ headers: sign({ secret: 'wrong' }), dataId: '1001', secret: SECRET }), false);
assert.equal(verifySignature({ headers: sign({}), dataId: '1002', secret: SECRET }), false);
assert.equal(verifySignature({ headers: {}, dataId: '1001', secret: SECRET }), false, 'absent');
assert.equal(verifySignature({ headers: { 'x-signature': 'garbage' }, dataId: '1001', secret: SECRET }), false);
assert.equal(verifySignature({ headers: { 'x-signature': 'ts=1,v1=zz' }, dataId: '1001', secret: SECRET }), false);
assert.equal(verifySignature({ headers: sign({ ts: Date.now() - 3_600_000 }), dataId: '1001', secret: SECRET }), false, 'stale');
assert.equal(verifySignature({ headers: sign({}), dataId: '1001', secret: '' }), false);
{
  const ts = Math.floor(Date.now() / 1000);
  assert.equal(verifySignature({ headers: sign({ ts }), dataId: '1001', secret: SECRET }), true, 'seconds ts');
}
{
  const withSecret = { ...config, webhookSecret: SECRET };
  const t = build(undefined, undefined, withSecret);
  t.mp.payment = payment();
  assert.equal((await t.webhook({ query: hookQuery, headers: {}, body: {} })).status, 401, 'absent signature');
  assert.equal((await t.webhook({ query: hookQuery, headers: sign({ secret: 'bad' }), body: {} })).status, 401, 'invalid');
  assert.equal(t.mp.calls.payments.length, 0, 'no MP call on bad signature');
  assert.equal((await t.webhook({ query: hookQuery, headers: sign({}), body: {} })).status, 200);
  assert.equal(t.db.docs.get(path('u1', 't1')).paymentStatus, 'approved');
}

// ---------- Mercado Pago client with fake fetch (CA-002-62) ----------
{
  const seen = [];
  const fakeFetch = async (url, init) => {
    seen.push({ url, init });
    if (url.endsWith('/checkout/preferences')) return { ok: true, status: 201, json: async () => ({ init_point: 'https://mp.test/pay' }) };
    if (url.includes('/v1/payments/search')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            { id: 2, status: 'rejected', external_reference: 't1', transaction_amount: 12000, currency_id: 'COP' },
            { id: 1, status: 'approved', external_reference: 't1', transaction_amount: 12000, currency_id: 'COP', metadata: { uid: 'u1' } },
          ],
        }),
      };
    }
    if (url.endsWith('/v1/payments/77')) return { ok: true, status: 200, json: async () => ({ id: 77, status: 'in_process', external_reference: 't1', transaction_amount: 12000, currency_id: 'COP' }) };
    return { ok: false, status: 404, json: async () => ({}) };
  };
  const client = createMercadoPagoClient({ accessToken: 'TEST-TOKEN-NOT-REAL', fetch: fakeFetch });
  const pref = await client.createPreference({ tripId: 't1', uid: 'u1', amount: 12000, currency: 'COP', notificationUrl: 'https://example.test/webhooks/mercadopago' });
  assert.deepEqual(pref, { url: 'https://mp.test/pay' });
  const sent = JSON.parse(seen[0].init.body);
  assert.equal(sent.external_reference, 't1');
  assert.equal(sent.items[0].unit_price, 12000);
  assert.equal(sent.items[0].currency_id, 'COP');
  assert.equal(seen[0].init.method, 'POST');
  assert.equal((await client.findPaymentByReference('t1')).id, '1', 'approved preferred');
  assert.equal((await client.getPayment(77)).mappedStatus, 'pending');
  await assert.rejects(() => client.getPayment(5), (e) => e.status === 404 && !String(e.message).includes('TEST-TOKEN'));
}

// ---------- route glue with express-like fakes (CA-002-66) ----------
function fakeApp() {
  const routes = {};
  return { routes, post: (p, h) => { routes[p] = h; } };
}
function fakeRes() {
  const res = { code: null, payload: null, status(c) { res.code = c; return res; }, json(b) { res.payload = b; return res; } };
  return res;
}
{
  const t = build();
  t.mp.payment = payment();
  const guard = createGuard({
    auth,
    userLimiter: createRateLimiter({ max: 3, windowMs: 60_000 }),
    ipLimiter: createRateLimiter({ max: 100, windowMs: 60_000 }),
  });
  const app = fakeApp();
  registerPaymentsRoutes(app, { guard, handlers: t.handlers });
  registerWebhookRoutes(app, { handler: t.webhook, ipLimiter: createRateLimiter({ max: 2, windowMs: 60_000 }) });
  const call = async (p, req) => { const res = fakeRes(); await app.routes[p](req, res); return res; };

  assert.equal((await call('/payments/checkout', { headers: {}, body: { tripId: 't1' }, ip: '1.1.1.1' })).code, 401);
  assert.equal((await call('/payments/checkout', { headers: { authorization: 'Bearer bad' }, body: { tripId: 't1' }, ip: '1.1.1.1' })).code, 401);
  const good = { headers: { authorization: 'Bearer good-u1' }, body: { tripId: 't1', provider: 'mercadopago' }, ip: '1.1.1.1' };
  assert.equal((await call('/payments/checkout', good)).code, 200);
  assert.equal((await call('/payments/sync', good)).code, 200);
  assert.equal((await call('/payments/checkout', good)).code, 400, 'approved after sync');
  assert.equal((await call('/payments/checkout', good)).code, 429, 'fourth call from the same user');
  assert.equal((await call('/payments/checkout', { ...good, headers: { authorization: 'Bearer good-u2' } })).code, 404, 'other user not limited');
  const hook = { query: hookQuery, headers: {}, body: {}, ip: '2.2.2.2' };
  assert.equal((await call('/webhooks/mercadopago', hook)).code, 200);
  assert.equal((await call('/webhooks/mercadopago', hook)).code, 200);
  assert.equal((await call('/webhooks/mercadopago', hook)).code, 429);
  // a throwing handler gives a generic 500 with no detail
  const bad = fakeApp();
  registerPaymentsRoutes(bad, { guard: async () => { throw new Error('secret detail'); }, handlers: t.handlers });
  const res = fakeRes();
  await bad.routes['/payments/sync']({ headers: {}, body: {} }, res);
  assert.deepEqual([res.code, res.payload], [500, { error: 'server_error' }]);
}
{
  const res = fakeRes();
  send(res, { status: 200, body: { a: 1 } });
  assert.deepEqual([res.code, res.payload], [200, { a: 1 }]);
}
{
  let time = 0;
  const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: () => time });
  assert.equal(limiter.hit('k'), true);
  assert.equal(limiter.hit('k'), false);
  time = 1001;
  assert.equal(limiter.hit('k'), true, 'window resets');
}

// ---------- static checks on backend/src ----------
function sources(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? sources(full) : full.endsWith('.js') ? [full] : [];
  });
}
const backendDir = new URL('../../backend/src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
for (const file of sources(backendDir)) {
  const text = readFileSync(file, 'utf8');
  const consoleCalls = text.split('\n').filter((line) => /console\./.test(line));
  if (!file.endsWith('server.js')) assert.equal(consoleCalls.length, 0, `${file}: no console.*`);
  for (const line of consoleCalls) {
    assert.ok(!/token|header|authorization|body|secret/i.test(line.replace(/MP_|backend\/\.env/g, '')), `${file}: log line leaks`);
  }
  assert.ok(!/Access-Control|cors\(/i.test(text.replace(/^\s*\/\/.*$/gm, '')), `${file}: CORS must stay closed`);
  assert.ok(!/process\.env/.test(text) || file.endsWith('config.js'), `${file}: env only in config`);
}
const gitignore = readFileSync(new URL('../../.gitignore', import.meta.url), 'utf8');
assert.ok(/^backend\/\.env$/m.test(gitignore) && /^backend\/secrets\/$/m.test(gitignore));
const example = readFileSync(new URL('../../backend/.env.example', import.meta.url), 'utf8');
for (const name of ['MP_ACCESS_TOKEN', 'FIREBASE_SERVICE_ACCOUNT_PATH', 'PUBLIC_BASE_URL', 'PORT', 'MP_WEBHOOK_SECRET']) {
  assert.ok(new RegExp(`^${name}=$`, 'm').test(example), name);
}

console.log('backendPayments.test.mjs: ok');
