// AI-assisted: see docs/AI_LOG.md #57
// Plain Node test for the payments client error classes (T-125, CA-002-101). Fakes of fetch only: no
// network, no Firebase. Run:
//   node scripts/tests/paymentsClient.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createPaymentsClient, PAYMENTS_ERROR, isUnreachable } = await import('../../src/services/trip/paymentsClient.js');
const { createPaymentActions, ACTION_ERROR } = await import('../../src/services/trip/paymentActions.js');

const URL_SECRET = 'https://secret-host.example/payments/checkout';
const TOKEN_SECRET = 'TOKEN_abc.def.ghi';
const reply = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const make = (fetchFn, extra = {}) =>
  createPaymentsClient({ fetchFn, getToken: async () => TOKEN_SECRET, baseUrl: 'https://secret-host.example', timeoutMs: 30, ...extra });

// Nine distinct, stable classes.
assert.equal(new Set(Object.values(PAYMENTS_ERROR)).size, 9);

const results = [];
async function expectClass(label, client, expected) {
  for (const call of [() => client.requestCheckoutUrl('t1'), () => client.syncPayment('t1')]) {
    const result = await call();
    assert.equal(result.ok, false, label);
    assert.equal(result.error, expected, label);
    assert.deepEqual(Object.keys(result).sort(), ['error', 'ok'], label);
    results.push(JSON.stringify(result));
  }
}

await expectClass('no url', make(async () => reply(200, {}), { baseUrl: '' }), PAYMENTS_ERROR.NOT_CONFIGURED);
await expectClass('absent url', make(async () => reply(200, {}), { baseUrl: undefined }), PAYMENTS_ERROR.NOT_CONFIGURED);
await expectClass('blank url', make(async () => reply(200, {}), { baseUrl: '   ' }), PAYMENTS_ERROR.NOT_CONFIGURED);
await expectClass('non-string url', make(async () => reply(200, {}), { baseUrl: 42 }), PAYMENTS_ERROR.NOT_CONFIGURED);
await expectClass('network', make(async () => { throw new TypeError(`Network request failed ${URL_SECRET} ${TOKEN_SECRET}`); }), PAYMENTS_ERROR.NETWORK);
await expectClass(
  'timeout (real abort)',
  make((url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error(URL_SECRET), { name: 'AbortError' }))))),
  PAYMENTS_ERROR.TIMEOUT,
);
await expectClass('401', make(async () => reply(401, { error: 'unauthorized' })), PAYMENTS_ERROR.AUTH);
await expectClass('403', make(async () => reply(403, {})), PAYMENTS_ERROR.AUTH);
await expectClass('no token', make(async () => reply(200, {}), { getToken: async () => null }), PAYMENTS_ERROR.AUTH);
await expectClass('getToken fails', make(async () => reply(200, {}), { getToken: async () => { throw new Error(TOKEN_SECRET); } }), PAYMENTS_ERROR.AUTH);
await expectClass('404', make(async () => reply(404, { error: 'not_found' })), PAYMENTS_ERROR.NOT_FOUND);
await expectClass('429', make(async () => reply(429, { error: 'rate_limited' })), PAYMENTS_ERROR.SERVER);
await expectClass('500', make(async () => reply(500, { error: 'server_error' })), PAYMENTS_ERROR.SERVER);
await expectClass('503', make(async () => reply(503, {})), PAYMENTS_ERROR.SERVER);
await expectClass('502 without backend code', make(async () => reply(502, {})), PAYMENTS_ERROR.SERVER);
await expectClass('502 unreadable body', make(async () => ({ status: 502, ok: false, json: async () => { throw new Error('x'); } })), PAYMENTS_ERROR.SERVER);
await expectClass('invalid json', make(async () => ({ status: 200, ok: true, json: async () => { throw new SyntaxError(URL_SECRET); } })), PAYMENTS_ERROR.INVALID_RESPONSE);
await expectClass('unexpected shape', make(async () => reply(200, { other: 1 })), PAYMENTS_ERROR.INVALID_RESPONSE);
await expectClass('provider 502', make(async () => reply(502, { error: 'upstream_error' })), PAYMENTS_ERROR.PROVIDER);
await expectClass('provider 422', make(async () => reply(422, { error: 'upstream_error' })), PAYMENTS_ERROR.PROVIDER);
await expectClass('400 provider not configured (#59)', make(async () => reply(400, { error: 'provider_not_configured' })), PAYMENTS_ERROR.PROVIDER_NOT_CONFIGURED);
await expectClass('400 invalid request', make(async () => reply(400, { error: 'invalid_request' })), PAYMENTS_ERROR.PROVIDER);

// Specific shape checks per endpoint.
await assert.deepEqual(await make(async () => reply(200, { url: 'http://insecure' })).requestCheckoutUrl('t'), { ok: false, error: PAYMENTS_ERROR.INVALID_RESPONSE });
await assert.deepEqual(await make(async () => reply(200, { paymentStatus: 7 })).syncPayment('t'), { ok: false, error: PAYMENTS_ERROR.INVALID_RESPONSE });

// A valid 200 and the request shape the backend expects (route, Bearer ID token, JSON body, abort signal).
{
  const seen = [];
  const client = make(async (url, init) => { seen.push({ url, init }); return reply(200, { url: 'https://mp.test/pay', paymentStatus: 'pending' }); });
  assert.deepEqual(await client.requestCheckoutUrl('t1'), { ok: true, url: 'https://mp.test/pay' });
  assert.deepEqual(await client.syncPayment('t2'), { ok: true, paymentStatus: 'pending' });
  assert.equal(seen[0].url, 'https://secret-host.example/payments/checkout');
  assert.equal(seen[1].url, 'https://secret-host.example/payments/sync');
  for (const { init } of seen) {
    assert.equal(init.method, 'POST');
    assert.equal(init.headers.Authorization, `Bearer ${TOKEN_SECRET}`);
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.ok(init.signal);
  }
  assert.deepEqual(JSON.parse(seen[0].init.body), { tripId: 't1' });
}

// Never a URL, a token or a header in any result.
for (const text of results) {
  assert.ok(!text.includes('secret-host'), text);
  assert.ok(!text.includes(TOKEN_SECRET), text);
  assert.ok(!/authorization|bearer|https?:/i.test(text), text);
}

// Unreachable group.
for (const code of [PAYMENTS_ERROR.NOT_CONFIGURED, PAYMENTS_ERROR.NETWORK, PAYMENTS_ERROR.TIMEOUT, PAYMENTS_ERROR.SERVER]) assert.equal(isUnreachable(code), true, code);
for (const code of [PAYMENTS_ERROR.AUTH, PAYMENTS_ERROR.NOT_FOUND, PAYMENTS_ERROR.INVALID_RESPONSE, PAYMENTS_ERROR.PROVIDER, 'failed', undefined]) assert.equal(isUnreachable(code), false, String(code));

// T-126: the action error carries the client class unchanged (one message per class on screen).
{
  for (const clientCode of Object.values(PAYMENTS_ERROR)) {
    const actions = createPaymentActions({
      requestCheckoutUrl: async () => ({ ok: false, error: clientCode }),
      syncPayment: async () => ({ ok: false, error: clientCode }),
      confirmCashPayment: async () => {},
      openUrl: async () => {},
    });
    assert.deepEqual(await actions.run('charge', { uid: 'u', tripId: 't', provider: 'mercadopago' }), { ok: false, error: clientCode }, clientCode);
    assert.deepEqual(await actions.run('verify', { uid: 'u', tripId: 't' }), { ok: false, error: clientCode }, clientCode);
  }
}

// AI-assisted: see docs/AI_LOG.md #58
// T-144 (RF-62, CA-002-123, CA-002-126): getProviders and the provider in checkout and sync.
{
  const seen = [];
  const client = make(async (url, init) => {
    seen.push({ url, init });
    if (url.endsWith('/payments/providers')) return reply(200, { mercadopago: true, stripe: false, extra: 'x' });
    return reply(200, { url: 'https://stripe.test/pay', paymentStatus: 'pending' });
  });
  // GET with the ID token, only booleans come back.
  assert.deepEqual(await client.getProviders(), { ok: true, providers: { mercadopago: true, stripe: false } });
  assert.equal(seen[0].url, 'https://secret-host.example/payments/providers');
  assert.equal(seen[0].init.method, 'GET');
  assert.equal(seen[0].init.headers.Authorization, `Bearer ${TOKEN_SECRET}`);
  assert.equal(seen[0].init.body, undefined);
  assert.ok(seen[0].init.signal);
  // Checkout and sync carry the provider; without it the body is the legacy one.
  assert.deepEqual(await client.requestCheckoutUrl('t1', 'stripe'), { ok: true, url: 'https://stripe.test/pay' });
  assert.deepEqual(JSON.parse(seen[1].init.body), { tripId: 't1', provider: 'stripe' });
  await client.requestCheckoutUrl('t1', 'mercadopago');
  assert.deepEqual(JSON.parse(seen[2].init.body), { tripId: 't1', provider: 'mercadopago' });
  await client.syncPayment('t1', 'stripe');
  assert.deepEqual(JSON.parse(seen[3].init.body), { tripId: 't1', provider: 'stripe' });
  await client.syncPayment('t1');
  assert.deepEqual(JSON.parse(seen[4].init.body), { tripId: 't1' });
  await client.requestCheckoutUrl('t1', 42);
  assert.deepEqual(JSON.parse(seen[5].init.body), { tripId: 't1' });
  assert.equal(seen[1].init.method, 'POST');
  // A non-https Stripe url is rejected like the Mercado Pago one.
  assert.deepEqual(await make(async () => reply(200, { url: 'http://stripe.test/pay' })).requestCheckoutUrl('t', 'stripe'), { ok: false, error: PAYMENTS_ERROR.INVALID_RESPONSE });
  // Truthy non-boolean values never count as configured.
  assert.deepEqual(await make(async () => reply(200, { mercadopago: 'yes', stripe: 1 })).getProviders(), { ok: true, providers: { mercadopago: false, stripe: false } });
}

// getProviders keeps the same eight error classes (a fake per class, no URL or token in the result).
for (const [label, fetchFn, extra, expected] of [
  ['no url', async () => reply(200, {}), { baseUrl: '' }, PAYMENTS_ERROR.NOT_CONFIGURED],
  ['network', async () => { throw new TypeError(`Network request failed ${URL_SECRET}`); }, {}, PAYMENTS_ERROR.NETWORK],
  ['timeout', (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error('x'), { name: 'AbortError' })))), {}, PAYMENTS_ERROR.TIMEOUT],
  ['401', async () => reply(401, {}), {}, PAYMENTS_ERROR.AUTH],
  ['no token', async () => reply(200, {}), { getToken: async () => null }, PAYMENTS_ERROR.AUTH],
  ['404', async () => reply(404, {}), {}, PAYMENTS_ERROR.NOT_FOUND],
  ['500', async () => reply(500, {}), {}, PAYMENTS_ERROR.SERVER],
  ['invalid json', async () => ({ status: 200, ok: true, json: async () => { throw new SyntaxError('x'); } }), {}, PAYMENTS_ERROR.INVALID_RESPONSE],
  ['null body', async () => reply(200, null), {}, PAYMENTS_ERROR.INVALID_RESPONSE],
  ['provider error', async () => reply(502, { error: 'upstream_error' }), {}, PAYMENTS_ERROR.PROVIDER],
]) {
  const result = await make(fetchFn, extra).getProviders();
  assert.deepEqual(result, { ok: false, error: expected }, label);
  assert.ok(!/secret-host|bearer|https?:/i.test(JSON.stringify(result)), label);
}

// The runner passes the provider to the client (checkout) and the trip's gateway to the sync.
{
  const calls = [];
  const actions = createPaymentActions({
    requestCheckoutUrl: async (id, provider) => { calls.push(['checkout', id, provider]); return { ok: true, url: 'https://stripe.test/pay' }; },
    syncPayment: async (id, provider) => { calls.push(['sync', id, provider]); return { ok: true, paymentStatus: 'pending' }; },
    confirmCashPayment: async () => {},
    openUrl: async () => {},
  });
  assert.deepEqual(await actions.run('charge', { uid: 'u', tripId: 't', provider: 'stripe' }), { ok: true });
  assert.deepEqual(await actions.run('verify', { uid: 'u', tripId: 't', provider: 'stripe' }), { ok: true });
  assert.deepEqual(calls, [['checkout', 't', 'stripe'], ['sync', 't', 'stripe']]);
}

console.log('paymentsClient: OK');
