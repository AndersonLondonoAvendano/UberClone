// AI-assisted: see docs/AI_LOG.md #55
// Plain Node tests for the payments client and the cash confirmation (T-95). No network, no Firebase,
// no Mercado Pago. Run:
//   node scripts/tests/paymentsService.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import './helpers/registerSrcLoader.mjs';

const { createPaymentsClient, PAYMENTS_ERROR } = await import('../../src/services/trip/paymentsClient.js');
const { confirmCashPayment } = await import('../../src/services/tripRepository.js');

const reply = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
function make(fetchFn, extra = {}) {
  return createPaymentsClient({ fetchFn, getToken: async () => 'ID_TOKEN', baseUrl: 'https://api.test/', timeoutMs: 50, ...extra });
}

// Request shape: only tripId in the body, Bearer token, trailing slash handled.
{
  const seen = [];
  const client = make(async (url, init) => { seen.push({ url, init }); return reply(200, { url: 'https://mp.test/pay' }); });
  assert.deepEqual(await client.requestCheckoutUrl('t1'), { ok: true, url: 'https://mp.test/pay' });
  assert.equal(seen[0].url, 'https://api.test/payments/checkout');
  assert.equal(seen[0].init.method, 'POST');
  assert.equal(seen[0].init.headers.Authorization, 'Bearer ID_TOKEN');
  assert.deepEqual(JSON.parse(seen[0].init.body), { tripId: 't1' });
}
{
  const seen = [];
  const client = make(async (url, init) => { seen.push({ url, init }); return reply(200, { paymentStatus: 'approved' }); });
  assert.deepEqual(await client.syncPayment('t2'), { ok: true, paymentStatus: 'approved' });
  assert.equal(seen[0].url, 'https://api.test/payments/sync');
  assert.deepEqual(JSON.parse(seen[0].init.body), { tripId: 't2' });
}

// Error classification, never a throw.
const failure = async (client) => (await client.requestCheckoutUrl('t1')).error;
assert.equal(await failure(make(async () => { throw new TypeError('Network request failed'); })), PAYMENTS_ERROR.NETWORK);
assert.equal(await failure(make(() => new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('a'), { name: 'AbortError' })), 5)))), PAYMENTS_ERROR.TIMEOUT);
assert.equal(await failure(make(async () => reply(500, {}))), PAYMENTS_ERROR.SERVER);
assert.equal(await failure(make(async () => reply(502, {}))), PAYMENTS_ERROR.SERVER);
assert.equal(await failure(make(async () => reply(429, {}))), PAYMENTS_ERROR.SERVER);
assert.equal(await failure(make(async () => reply(400, {}))), PAYMENTS_ERROR.PROVIDER);
assert.equal(await failure(make(async () => reply(401, {}))), PAYMENTS_ERROR.AUTH);
assert.equal(await failure(make(async () => reply(404, {}))), PAYMENTS_ERROR.NOT_FOUND);
assert.equal(await failure(make(async () => reply(200, { url: 'http://insecure' }))), PAYMENTS_ERROR.INVALID_RESPONSE);
assert.equal(await failure(make(async () => reply(200, {}))), PAYMENTS_ERROR.INVALID_RESPONSE);
assert.equal(await failure(make(async () => ({ status: 200, ok: true, json: async () => { throw new Error('bad json'); } }))), PAYMENTS_ERROR.INVALID_RESPONSE);
assert.equal(await failure(make(async () => reply(200, {}), { baseUrl: '' })), PAYMENTS_ERROR.NOT_CONFIGURED);
assert.equal(await failure(make(async () => reply(200, {}), { getToken: async () => null })), PAYMENTS_ERROR.AUTH);
assert.equal(await failure(make(async () => reply(200, {}), { getToken: async () => { throw new Error('x'); } })), PAYMENTS_ERROR.AUTH);
assert.equal((await make(async () => reply(200, { paymentStatus: 7 })).syncPayment('t')).ok, false);

// Cash confirmation: exactly the two fields, at the trip document, nothing else.
globalThis.__fsCalls.length = 0;
await confirmCashPayment('uid1', 'trip1');
assert.equal(globalThis.__fsCalls.length, 1);
assert.equal(globalThis.__fsCalls[0].op, 'updateDoc');
assert.equal(globalThis.__fsCalls[0].path, 'drivers/uid1/trips/trip1');
assert.deepEqual(globalThis.__fsCalls[0].data, { paymentStatus: 'paid', status: 'paid' });

// No Mercado Pago secret and no card-payment write anywhere in src/.
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.js')) out.push(full);
  }
  return out;
}
const hits = walk('src').filter((file) => /MP_ACCESS_TOKEN|APP_USR-|TEST-[0-9a-f]{8}/.test(readFileSync(file, 'utf8')));
assert.deepEqual(hits, []);
console.log('paymentsService: OK');
