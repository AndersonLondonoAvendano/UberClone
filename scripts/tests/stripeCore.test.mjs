// AI-assisted: see docs/AI_LOG.md #58
// Plain Node tests for the pure Stripe logic (T-136): amount, form encoding, session mapping and
// webhook signature. No network, no Firebase. Run:
//   node scripts/tests/stripeCore.test.mjs
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  StripeError,
  createStripeClient,
  encodeForm,
  mapStripeSession,
  toStripeUnitAmount,
  verifyStripeSignature,
} from '../../backend/src/stripe.js';

// ---------- toStripeUnitAmount (CA-002-112) ----------
assert.deepEqual(toStripeUnitAmount(10_000), { amount: 1_000_000, currency: 'cop' });
assert.deepEqual(toStripeUnitAmount(10_000, { currency: 'COP' }), { amount: 1_000_000, currency: 'cop' });
assert.deepEqual(toStripeUnitAmount(1), { amount: 100, currency: 'cop' });
assert.deepEqual(toStripeUnitAmount(2_000_000), { amount: 200_000_000, currency: 'cop' });
for (const bad of [10.5, 0, -5, 2_000_001, NaN, Infinity, '10000', null, undefined]) {
  assert.equal(toStripeUnitAmount(bad), null, `fare ${String(bad)}`);
}
assert.equal(toStripeUnitAmount(500, { maxAmountCop: 400 }), null);
assert.equal(toStripeUnitAmount(10_000, { currency: 'eur' }), null);
assert.equal(toStripeUnitAmount(10_000, { currency: 5 }), null);
// usd fallback: 10 000 COP at 4 000 COP/USD = 2.50 USD = 250 cents.
assert.deepEqual(toStripeUnitAmount(10_000, { currency: 'usd', copPerUsd: 4_000 }), { amount: 250, currency: 'usd' });
assert.deepEqual(toStripeUnitAmount(10_001, { currency: 'USD', copPerUsd: 4_000 }), { amount: 250, currency: 'usd' });
for (const rate of [undefined, 0, -1, NaN, Infinity, '4000', null]) {
  assert.equal(toStripeUnitAmount(10_000, { currency: 'usd', copPerUsd: rate }), null, `rate ${String(rate)}`);
}
// Below the 50-cent minimum.
assert.equal(toStripeUnitAmount(1_000, { currency: 'usd', copPerUsd: 4_000 }), null);

// ---------- encodeForm ----------
assert.equal(encodeForm({}), '');
assert.equal(encodeForm(undefined), '');
assert.equal(encodeForm({ a: 'x', b: 2, c: true }), 'a=x&b=2&c=true');
assert.equal(encodeForm({ a: undefined, b: null, c: 'ok' }), 'c=ok');
assert.equal(encodeForm({ metadata: { tripId: 't1', uid: 'u 1' } }), 'metadata[tripId]=t1&metadata[uid]=u%201');
assert.equal(
  encodeForm({ line_items: [{ price_data: { currency: 'cop', unit_amount: 1_000_000 }, quantity: 1 }] }),
  'line_items[0][price_data][currency]=cop&line_items[0][price_data][unit_amount]=1000000&line_items[0][quantity]=1',
);
assert.equal(encodeForm({ expand: ['payment_intent', 'x'] }), 'expand[0]=payment_intent&expand[1]=x');
// Values are percent-encoded; nothing can inject extra pairs.
assert.equal(encodeForm({ name: 'a&b=c' }), 'name=a%26b%3Dc');
assert.equal(encodeForm({ url: 'https://x.test/p?a=1&b=2' }), 'url=https%3A%2F%2Fx.test%2Fp%3Fa%3D1%26b%3D2');

// ---------- mapStripeSession (CA-002-113) ----------
const ctx = { tripId: 't1', expectedAmount: 1_000_000, expectedCurrency: 'cop' };
const session = (over = {}) => ({
  id: 'cs_test_FAKE1', status: 'open', payment_status: 'unpaid', client_reference_id: 't1', amount_total: 1_000_000, currency: 'cop', ...over,
});
assert.deepEqual(mapStripeSession(session({ status: 'complete', payment_status: 'paid' }), ctx), { status: 'approved', id: 'cs_test_FAKE1', matches: true });
assert.deepEqual(mapStripeSession(session({ status: 'expired' }), ctx), { status: 'rejected', id: 'cs_test_FAKE1', matches: true });
assert.deepEqual(mapStripeSession(session(), ctx), { status: 'pending', id: 'cs_test_FAKE1', matches: true });
assert.equal(mapStripeSession(session({ payment_status: 'no_payment_required' }), ctx).status, 'pending');
assert.equal(mapStripeSession(session({ payment_intent: { last_payment_error: { code: 'card_declined' } } }), ctx).status, 'rejected');
assert.equal(mapStripeSession(session({ payment_intent: { last_payment_error: null } }), ctx).status, 'pending');
assert.equal(mapStripeSession(session({ payment_intent: 'pi_FAKE' }), ctx).status, 'pending');
// Paid wins over an earlier error (the payer retried inside the same session).
assert.equal(mapStripeSession(session({ payment_status: 'paid', payment_intent: { last_payment_error: { code: 'x' } } }), ctx).status, 'approved');
// Mismatches: trip, amount, currency (case-insensitive currency still matches).
assert.equal(mapStripeSession(session({ client_reference_id: 'other' }), ctx).matches, false);
assert.equal(mapStripeSession(session({ amount_total: 1 }), ctx).matches, false);
assert.equal(mapStripeSession(session({ currency: 'usd' }), ctx).matches, false);
assert.equal(mapStripeSession(session({ currency: 'COP' }), ctx).matches, true);
assert.equal(mapStripeSession(session({ amount_total: undefined }), ctx).matches, false);
assert.equal(mapStripeSession(session(), { ...ctx, expectedAmount: undefined }).matches, false);
// Garbage input never throws and never matches.
for (const bad of [null, undefined, 'x', 5]) {
  assert.deepEqual(mapStripeSession(bad, ctx), { status: 'pending', id: null, matches: false });
}
assert.equal(mapStripeSession({}, ctx).id, null);

// ---------- verifyStripeSignature (CA-002-113) ----------
const SECRET = 'whsec_FAKE-SECRET-TOKEN-123';
const NOW_MS = 1_800_000_000_000;
const T = String(NOW_MS / 1000);
const body = JSON.stringify({ id: 'evt_FAKE', data: { object: { id: 'cs_test_FAKE1' } } });
const sign = (t, raw, secret = SECRET) => createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
const verify = (over = {}) => verifyStripeSignature({ rawBody: body, header: `t=${T},v1=${sign(T, body)}`, secret: SECRET, now: NOW_MS, ...over });

assert.equal(verify(), true);
assert.equal(verify({ rawBody: Buffer.from(body, 'utf8') }), true);
assert.equal(verify({ rawBody: new TextEncoder().encode(body) }), true);
// Tampered body, wrong secret, wrong signature.
assert.equal(verify({ rawBody: body + ' ' }), false);
assert.equal(verify({ secret: 'whsec_other' }), false);
assert.equal(verify({ header: `t=${T},v1=${sign(T, body).replace(/.$/, (c) => (c === '0' ? '1' : '0'))}` }), false);
assert.equal(verify({ header: `t=${T},v1=${sign(String(Number(T) + 1), body)}` }), false);
// Tolerance: 300 s inclusive, 301 s rejected, future timestamps too.
assert.equal(verify({ now: NOW_MS + 300_000 }), true);
assert.equal(verify({ now: NOW_MS + 301_000 }), false);
assert.equal(verify({ now: NOW_MS - 301_000 }), false);
assert.equal(verify({ now: NOW_MS + 10_000, toleranceSec: 5 }), false);
// Missing or malformed pieces.
assert.equal(verify({ secret: '' }), false);
assert.equal(verify({ secret: undefined }), false);
assert.equal(verify({ header: undefined }), false);
assert.equal(verify({ header: '' }), false);
assert.equal(verify({ header: `t=${T}` }), false);
assert.equal(verify({ header: `v1=${sign(T, body)}` }), false);
assert.equal(verify({ header: `t=abc,v1=${sign(T, body)}` }), false);
assert.equal(verify({ header: `t=${T},v1=zz` }), false);
assert.equal(verify({ header: `t=${T},v1=${sign(T, body).slice(0, 62)}` }), false);
assert.equal(verify({ header: 'garbage' }), false);
assert.equal(verify({ rawBody: undefined }), false);
assert.equal(verify({ rawBody: { not: 'a body' } }), false);
// Several v1: any valid one passes; only invalid ones fail. v0 and unknown entries are ignored.
const good = sign(T, body);
const bad = sign(T, 'other');
assert.equal(verify({ header: `t=${T},v1=${bad},v1=${good}` }), true);
assert.equal(verify({ header: `t=${T},v1=${good},v1=${bad}` }), true);
assert.equal(verify({ header: `t=${T},v1=${bad},v1=${bad}` }), false);
assert.equal(verify({ header: `t=${T},v0=${good},v1=${bad}` }), false);
assert.equal(verify({ header: `t=${T},v0=${bad},v1=${good},foo=bar` }), true);
assert.equal(verify({ header: ` t=${T} , v1=${good} ` }), true);

// ---------- createStripeClient (T-137; CA-002-111, CA-002-113, CA-002-115, CA-002-128) ----------
const KEY = 'sk_test_FAKE-SECRET-TOKEN-123';
const reply = (status, payload) => ({ status, ok: status >= 200 && status < 300, json: async () => payload });
function recorder(handler) {
  const seen = [];
  const fetch = async (url, init) => { seen.push({ url, init }); return handler(url, init); };
  return { seen, fetch };
}
const NOW_SEC = 1_800_000_000;
const makeClient = (fetch) => createStripeClient({ secretKey: KEY, fetch, now: () => NOW_SEC * 1000 });
const checkoutArgs = {
  tripId: 't1', uid: 'u1', amount: 1_000_000, currency: 'cop',
  successUrl: 'https://example.test/payments/return', cancelUrl: 'https://example.test/payments/return', idempotencyKey: 'uc-t1-100',
};

{
  const { seen, fetch } = recorder(() => reply(200, { id: 'cs_test_FAKE1', url: 'https://checkout.stripe.test/c/pay/cs_test_FAKE1' }));
  const result = await makeClient(fetch).createCheckoutSession(checkoutArgs);
  assert.deepEqual(result, { id: 'cs_test_FAKE1', url: 'https://checkout.stripe.test/c/pay/cs_test_FAKE1' });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].url, 'https://api.stripe.com/v1/checkout/sessions');
  const { init } = seen[0];
  assert.equal(init.method, 'POST');
  assert.equal(init.headers.Authorization, `Basic ${Buffer.from(`${KEY}:`).toString('base64')}`);
  assert.equal(init.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(init.headers['Idempotency-Key'], 'uc-t1-100');
  assert.ok(init.signal instanceof AbortSignal);
  // The key travels only in the Authorization header, never in the URL or the body.
  assert.ok(!seen[0].url.includes(KEY));
  assert.ok(!String(init.body).includes(KEY));
  // Form-encoded body in bracket notation.
  const form = new URLSearchParams(init.body);
  assert.equal(form.get('mode'), 'payment');
  assert.equal(form.get('line_items[0][price_data][currency]'), 'cop');
  assert.equal(form.get('line_items[0][price_data][unit_amount]'), '1000000');
  assert.equal(form.get('line_items[0][price_data][product_data][name]'), 'Viaje UberClone (pago de prueba)');
  assert.equal(form.get('line_items[0][quantity]'), '1');
  assert.equal(form.get('client_reference_id'), 't1');
  assert.equal(form.get('metadata[tripId]'), 't1');
  assert.equal(form.get('metadata[uid]'), 'u1');
  assert.equal(form.get('success_url'), 'https://example.test/payments/return');
  assert.equal(form.get('cancel_url'), 'https://example.test/payments/return');
  // expires_at is at least 30 minutes ahead (and at most 24 h).
  const ahead = Number(form.get('expires_at')) - NOW_SEC;
  assert.ok(ahead >= 30 * 60 && ahead <= 24 * 3600, `expires_at ahead ${ahead}`);
}
// Without an idempotency key the header is simply absent.
{
  const { seen, fetch } = recorder(() => reply(200, { id: 'cs_test_FAKE1', url: 'https://c.test/x' }));
  await makeClient(fetch).createCheckoutSession({ ...checkoutArgs, idempotencyKey: undefined });
  assert.ok(!('Idempotency-Key' in seen[0].init.headers));
}
// getCheckoutSession: GET, Basic auth, expanded payment intent, no body, no idempotency key.
{
  const { seen, fetch } = recorder(() => reply(200, { id: 'cs_test_FAKE1', payment_status: 'paid' }));
  const result = await makeClient(fetch).getCheckoutSession('cs_test_FAKE1');
  assert.deepEqual(result, { id: 'cs_test_FAKE1', payment_status: 'paid' });
  assert.equal(seen[0].url, 'https://api.stripe.com/v1/checkout/sessions/cs_test_FAKE1?expand[]=payment_intent');
  assert.equal(seen[0].init.method, 'GET');
  assert.equal(seen[0].init.body, undefined);
  assert.equal(seen[0].init.headers.Authorization, `Basic ${Buffer.from(`${KEY}:`).toString('base64')}`);
  assert.ok(!('Idempotency-Key' in seen[0].init.headers));
  assert.ok(!('Content-Type' in seen[0].init.headers));
}
// A malformed session id never reaches the network (no path injection).
for (const badId of ['', 'x', 'cs_', 'cs_a/../b', 'cs_a?x=1', undefined, 5, 'pi_FAKE']) {
  const { seen, fetch } = recorder(() => reply(200, {}));
  await assert.rejects(makeClient(fetch).getCheckoutSession(badId), (error) => error instanceof StripeError && error.status === 400);
  assert.equal(seen.length, 0);
}
// Errors carry only the status and never leak the key (CA-002-113).
function assertNoLeak(error, status) {
  assert.ok(error instanceof StripeError);
  assert.equal(error.status, status);
  assert.equal(error.message, 'stripe_request_failed');
  const dump = [error.message, error.stack, String(error), JSON.stringify(error), Object.keys(error).join(',')].join('|');
  assert.ok(!dump.includes(KEY));
  assert.ok(!dump.includes(Buffer.from(`${KEY}:`).toString('base64')));
  assert.ok(!/authorization|bearer|basic /i.test(error.message));
}
for (const status of [400, 401, 402, 403, 404, 409, 429, 500, 503]) {
  const client = makeClient(async () => reply(status, { error: { message: `bad key ${KEY}` } }));
  await assert.rejects(client.createCheckoutSession(checkoutArgs), (error) => { assertNoLeak(error, status); return true; });
  await assert.rejects(client.getCheckoutSession('cs_test_FAKE1'), (error) => { assertNoLeak(error, status); return true; });
}
// Network failure or timeout whose message contains the key: status 0, key not carried over.
for (const thrown of [new Error(`connect failed with ${KEY}`), Object.assign(new Error('timed out'), { name: 'TimeoutError' })]) {
  const client = makeClient(async () => { throw thrown; });
  await assert.rejects(client.createCheckoutSession(checkoutArgs), (error) => { assertNoLeak(error, 0); return true; });
  await assert.rejects(client.getCheckoutSession('cs_test_FAKE1'), (error) => { assertNoLeak(error, 0); return true; });
}
// Not JSON, or a 200 without id/url: still a StripeError.
await assert.rejects(
  makeClient(async () => ({ status: 200, ok: true, json: async () => { throw new SyntaxError(KEY); } })).getCheckoutSession('cs_test_FAKE1'),
  (error) => { assertNoLeak(error, 200); return true; },
);
for (const payload of [{}, { id: 'cs_test_FAKE1' }, { url: 'https://c.test/x' }, { id: '', url: 'https://c.test/x' }, null]) {
  await assert.rejects(
    makeClient(async () => reply(200, payload)).createCheckoutSession(checkoutArgs),
    (error) => { assertNoLeak(error, 502); return true; },
  );
}

// ---------- no new dependencies (CA-002-128) ----------
{
  const pkg = JSON.parse(readFileSync(new URL('../../backend/package.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['express', 'firebase-admin']);
  assert.equal(pkg.devDependencies, undefined);
}

console.log('stripeCore tests passed');
