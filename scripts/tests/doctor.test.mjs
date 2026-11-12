// AI-assisted: see docs/AI_LOG.md #57
// AI-assisted: see docs/AI_LOG.md #58
// Plain Node tests for the backend diagnostic (T-127, T-128). Fakes only: no real env, disk,
// Firebase or network. Run:
//   node scripts/tests/doctor.test.mjs
import assert from 'node:assert/strict';

const logged = [];
const originalLog = console.log;
console.log = (...args) => logged.push(args.join(' '));
const { runDoctor } = await import('../../backend/scripts/doctor.mjs');
console.log = originalLog;
// Importing the module must not run the diagnostic.
assert.equal(logged.length, 0);

const SECRETS = {
  token: 'FAKE-SECRET-TOKEN-123',
  webhook: 'SECRET-WEBHOOK-456',
  privateKey: '-----BEGIN PRIVATE KEY-----SECRETKEYBODY',
  email: 'secret-account@secret-project.iam.gserviceaccount.com',
  projectId: 'secret-project-id',
  dir: 'C:/SECRETDIR/private',
};
const KEY_FILE = `${SECRETS.dir}/service-account.json`;
const goodKey = { project_id: SECRETS.projectId, client_email: SECRETS.email, private_key: SECRETS.privateKey };

const goodEnv = () => ({
  MP_ACCESS_TOKEN: SECRETS.token,
  FIREBASE_SERVICE_ACCOUNT_PATH: KEY_FILE,
  PUBLIC_BASE_URL: 'https://example.test',
  PORT: '3001',
  MP_WEBHOOK_SECRET: SECRETS.webhook,
});
const okFs = (content = JSON.stringify(goodKey)) => ({ readFileSync: () => content });
const okAdmin = async () => ({ db: { doc: () => ({ get: async () => ({ exists: false }) }) } });
const okFetch = async () => ({ ok: true, status: 200 });

async function run(overrides = {}) {
  const lines = [];
  const outcome = await runDoctor({
    env: goodEnv(),
    fs: okFs(),
    loadAdmin: okAdmin,
    fetchFn: okFetch,
    nodeVersion: '22.1.0',
    log: (line) => lines.push(line),
    ...overrides,
  });
  return { ...outcome, lines };
}
const statusOf = (outcome, fragment) => outcome.results.find((r) => r.message.includes(fragment))?.status;

// All OK.
{
  const out = await run();
  assert.equal(out.exitCode, 0);
  // Only Mercado Pago is configured, so the single non-OK line is Stripe's "no configurada".
  const notOk = out.results.filter((r) => r.status !== 'OK');
  assert.deepEqual(notOk.map((r) => r.message), ['Pasarela Stripe: no configurada.'], JSON.stringify(out.results));
  assert.equal(out.lines.length, out.results.length);
}

// Node version.
assert.equal(statusOf(await run({ nodeVersion: '20.12.0' }), 'Node'), 'OK');
assert.equal(statusOf(await run({ nodeVersion: '20.11.9' }), 'Node'), 'ERROR');
assert.equal((await run({ nodeVersion: '18.0.0' })).exitCode, 1);
assert.equal(statusOf(await run({ nodeVersion: 'abc' }), 'Node'), 'ERROR');

// Variables: FALTA by name, exit code 1, dependent steps skipped.
for (const name of ['MP_ACCESS_TOKEN', 'FIREBASE_SERVICE_ACCOUNT_PATH']) {
  const env = goodEnv();
  delete env[name];
  const out = await run({ env });
  assert.equal(statusOf(out, `Variable ${name}`), 'FALTA');
  assert.equal(out.exitCode, 1);
}
{
  const env = goodEnv();
  env.MP_ACCESS_TOKEN = '   ';
  assert.equal(statusOf(await run({ env }), 'Variable MP_ACCESS_TOKEN'), 'FALTA');
}
{
  const env = goodEnv();
  delete env.PORT;
  delete env.MP_WEBHOOK_SECRET;
  const out = await run({ env });
  assert.equal(statusOf(out, 'PORT'), 'AVISO');
  assert.equal(statusOf(out, 'MP_WEBHOOK_SECRET'), 'AVISO');
  assert.equal(out.exitCode, 0);
}
{
  const env = goodEnv();
  env.PORT = '99999';
  const out = await run({ env });
  assert.equal(statusOf(out, 'PORT'), 'ERROR');
  assert.equal(out.exitCode, 1);
}

// Service account file: unreadable, invalid JSON, missing fields; only the file name is shown.
{
  const out = await run({ fs: { readFileSync: () => { throw new Error(`ENOENT ${KEY_FILE}`); } } });
  assert.equal(statusOf(out, 'Llave de Firebase'), 'ERROR');
  assert.ok(out.results.some((r) => r.message.includes('"service-account.json"')));
  assert.equal(statusOf(out, 'Firestore'), 'AVISO');
  assert.equal(out.exitCode, 1);
}
{
  const out = await run({ fs: okFs('{not json ' + SECRETS.privateKey) });
  assert.equal(statusOf(out, 'no es JSON válido'), 'ERROR');
}
{
  const out = await run({ fs: okFs(JSON.stringify({ project_id: SECRETS.projectId })) });
  const line = out.results.find((r) => r.message.includes('le falta el campo'));
  assert.equal(line.status, 'ERROR');
  assert.ok(line.message.includes('client_email, private_key'));
  assert.equal(out.exitCode, 1);
}
{
  const out = await run({ fs: okFs('null') });
  assert.equal(out.exitCode, 1);
  assert.equal(statusOf(out, 'Llave de Firebase'), 'ERROR');
}

// Firestore: init/read failure vs network failure; the read targets a harmless document.
{
  const paths = [];
  const out = await run({ loadAdmin: async () => ({ db: { doc: (p) => { paths.push(p); return { get: async () => ({ exists: false }) }; } } }) });
  assert.equal(statusOf(out, 'Firestore'), 'OK');
  assert.deepEqual(paths, ['_doctor/ping']);
}
{
  const out = await run({ loadAdmin: async () => { throw Object.assign(new Error(SECRETS.privateKey), { code: 'app/invalid-credential' }); } });
  assert.equal(statusOf(out, 'Firestore'), 'ERROR');
  assert.ok(!out.results.find((r) => r.message.startsWith('Firestore')).message.includes('conexión'));
}
{
  const out = await run({ loadAdmin: async () => ({ db: { doc: () => ({ get: async () => { throw Object.assign(new Error('x'), { code: 14 }); } }) } }) });
  const line = out.results.find((r) => r.message.startsWith('Firestore'));
  assert.equal(line.status, 'ERROR');
  assert.ok(line.message.includes('conexión'));
}

// Mercado Pago: OK, HTTP code, network failure; request shape.
{
  const seen = [];
  await run({ fetchFn: async (url, init) => { seen.push({ url, init }); return { ok: true, status: 200 }; } });
  assert.equal(seen[0].url, 'https://api.mercadopago.com/users/me');
  assert.equal(seen[0].init.method, 'GET');
  assert.equal(seen[0].init.headers.Authorization, `Bearer ${SECRETS.token}`);
}
{
  const out = await run({ fetchFn: async () => ({ ok: false, status: 401 }) });
  const line = out.results.find((r) => r.message.startsWith('Mercado Pago'));
  assert.equal(line.status, 'ERROR');
  assert.ok(line.message.includes('HTTP 401'));
  assert.equal(out.exitCode, 1);
}
{
  const out = await run({ fetchFn: async () => { throw new TypeError(`fetch failed Bearer ${SECRETS.token}`); } });
  const line = out.results.find((r) => r.message.startsWith('Mercado Pago'));
  assert.equal(line.status, 'ERROR');
  assert.ok(line.message.includes('conexión'));
}
{
  const env = goodEnv();
  delete env.MP_ACCESS_TOKEN;
  let called = false;
  const out = await run({ env, fetchFn: async () => { called = true; return okFetch(); } });
  assert.equal(called, false);
  assert.equal(statusOf(out, 'Mercado Pago'), 'AVISO');
}

// PUBLIC_BASE_URL: warning only, never a failure by itself.
for (const value of [undefined, 'http://example.test', 'not a url']) {
  const env = goodEnv();
  if (value === undefined) delete env.PUBLIC_BASE_URL;
  else env.PUBLIC_BASE_URL = value;
  const out = await run({ env });
  assert.equal(out.results.find((r) => r.message.startsWith('PUBLIC_BASE_URL')).status, 'AVISO', String(value));
  assert.equal(out.exitCode, 0);
}

// Stripe and gateway summary. Fake keys are built with join so no key literal sits in the source.
const stripeKey = (prefix) => [prefix, 'FAKE-SECRET-TOKEN-123'].join('_');
const TEST_KEY = stripeKey('sk_test');
const withStripe = (extra = {}, base = goodEnv()) => ({ ...base, STRIPE_SECRET_KEY: TEST_KEY, STRIPE_WEBHOOK_SECRET: SECRETS.webhook, ...extra });
const noMp = () => { const env = goodEnv(); delete env.MP_ACCESS_TOKEN; return env; };
const lineOf = (out, start) => out.results.find((r) => r.message.startsWith(start));
const stripeFetch = (status, seen = []) => async (url, init) => {
  seen.push({ url, init });
  return url.includes('stripe') ? { ok: status === 200, status } : { ok: true, status: 200 };
};
const neverStripe = (urls) => async (url) => { urls.push(url); return { ok: true, status: 200 }; };

// Only Stripe configured: Mercado Pago becomes a warning and the run passes.
{
  const seen = [];
  const out = await run({ env: withStripe({}, noMp()), fetchFn: stripeFetch(200, seen) });
  assert.equal(out.exitCode, 0, JSON.stringify(out.results));
  assert.equal(lineOf(out, 'Stripe:').status, 'OK');
  assert.ok(lineOf(out, 'Stripe:').message.endsWith('OK.'));
  assert.equal(statusOf(out, 'Variable MP_ACCESS_TOKEN'), 'AVISO');
  assert.equal(lineOf(out, 'Pasarela Mercado Pago').message, 'Pasarela Mercado Pago: no configurada.');
  assert.equal(lineOf(out, 'Pasarela Stripe').message, 'Pasarela Stripe: configurada.');
  assert.equal(seen.length, 1);
  assert.equal(seen[0].url, 'https://api.stripe.com/v1/balance');
  assert.equal(seen[0].init.method, 'GET');
  assert.match(seen[0].init.headers.Authorization, /^Basic [A-Za-z0-9+/=]+$/);
}
// Both configured.
{
  const out = await run({ env: withStripe(), fetchFn: stripeFetch(200) });
  assert.equal(out.exitCode, 0);
  assert.equal(lineOf(out, 'Pasarela Mercado Pago').status, 'OK');
  assert.equal(lineOf(out, 'Pasarela Stripe').status, 'OK');
}
// Neither configured: the only global ERROR for lack of gateways.
{
  const out = await run({ env: noMp() });
  assert.equal(out.exitCode, 1);
  assert.ok(lineOf(out, 'Ninguna pasarela configurada'));
  assert.equal(lineOf(out, 'Pasarela Stripe').message, 'Pasarela Stripe: no configurada.');
}
// Mercado Pago alone is enough: exit 0, and the Stripe API is never called.
{
  const urls = [];
  const out = await run({ fetchFn: neverStripe(urls) });
  assert.equal(out.exitCode, 0);
  assert.ok(urls.every((u) => !u.includes('stripe')));
}
// Live and invalid keys: ERROR for that gateway, no network call to Stripe; Mercado Pago carries on.
for (const prefix of ['sk_live', 'rk_live']) {
  const urls = [];
  const out = await run({ env: withStripe({ STRIPE_SECRET_KEY: stripeKey(prefix) }), fetchFn: neverStripe(urls) });
  assert.equal(lineOf(out, 'Stripe:').status, 'ERROR');
  assert.ok(lineOf(out, 'Stripe:').message.includes('live'));
  assert.ok(urls.every((u) => !u.includes('stripe')), prefix);
  assert.equal(lineOf(out, 'Pasarela Stripe').message, 'Pasarela Stripe: no configurada.');
  assert.equal(out.exitCode, 1); // a live key on any gateway fails the run, even if Mercado Pago works (#59)
  const aloneUrls = [];
  const alone = await run({ env: withStripe({ STRIPE_SECRET_KEY: stripeKey(prefix) }, noMp()), fetchFn: neverStripe(aloneUrls) });
  assert.equal(alone.exitCode, 1); // a live key and nothing else: no gateway
  assert.equal(aloneUrls.length, 0);
}
{
  const urls = [];
  const out = await run({ env: withStripe({ STRIPE_SECRET_KEY: 'not-a-key-FAKE-SECRET-TOKEN-123' }), fetchFn: neverStripe(urls) });
  assert.equal(lineOf(out, 'Stripe:').status, 'ERROR');
  assert.ok(urls.every((u) => !u.includes('stripe')));
}
// OK vs HTTP status (401, 403) and network failure; only the code is shown.
{
  const out = await run({ env: withStripe({}, noMp()), fetchFn: stripeFetch(401) });
  const line = lineOf(out, 'Stripe:');
  assert.equal(line.status, 'ERROR');
  assert.ok(line.message.includes('HTTP 401'));
  assert.equal(out.exitCode, 1);
  const forbidden = await run({ env: withStripe({}, noMp()), fetchFn: stripeFetch(403) });
  assert.ok(lineOf(forbidden, 'Stripe:').message.includes('HTTP 403'));
  assert.ok(lineOf(forbidden, 'Stripe:').message.includes('permisos'));
  // A failing Stripe does not fail the run while Mercado Pago works.
  const both = await run({ env: withStripe(), fetchFn: stripeFetch(401) });
  assert.equal(both.exitCode, 0);
  assert.equal(lineOf(both, 'Stripe:').status, 'ERROR');
}
{
  const out = await run({ env: withStripe({}, noMp()), fetchFn: async () => { throw new TypeError(`fetch failed ${TEST_KEY}`); } });
  assert.ok(lineOf(out, 'Stripe:').message.includes('conexión'));
  assert.equal(out.exitCode, 1);
}
// Missing webhook secret: warning only.
{
  const env = withStripe();
  delete env.STRIPE_WEBHOOK_SECRET;
  const out = await run({ env, fetchFn: stripeFetch(200) });
  assert.equal(statusOf(out, 'Variable STRIPE_WEBHOOK_SECRET'), 'AVISO');
  assert.equal(out.exitCode, 0);
  const withSecret = await run({ env: withStripe(), fetchFn: stripeFetch(200) });
  assert.equal(statusOf(withSecret, 'Variable STRIPE_WEBHOOK_SECRET'), undefined);
}
// Output carries no Stripe secret in any scenario.
for (const [env, fetchFn] of [
  [withStripe(), stripeFetch(200)],
  [withStripe(), stripeFetch(401)],
  [withStripe({ STRIPE_SECRET_KEY: stripeKey('sk_live') }), stripeFetch(200)],
  [withStripe({}, noMp()), async () => { throw new Error(`Bearer ${TEST_KEY}`); }],
]) {
  const out = await run({ env, fetchFn });
  const everything = JSON.stringify([out.results, out.lines]) + out.lines.join('\n');
  for (const value of [TEST_KEY, stripeKey('sk_live'), SECRETS.token, SECRETS.webhook, 'FAKE-SECRET-TOKEN-123']) {
    assert.ok(!everything.includes(value), `leaked ${value}`);
  }
}

// Every line has a known prefix, and no secret appears anywhere (success and failure scenarios).
const scenarios = [
  {},
  { fs: { readFileSync: () => { throw new Error(KEY_FILE + SECRETS.privateKey); } } },
  { fs: okFs('{bad ' + JSON.stringify(goodKey)) },
  { fs: okFs(JSON.stringify({ private_key: SECRETS.privateKey })) },
  { loadAdmin: async () => { throw new Error(`${SECRETS.privateKey} ${SECRETS.email} ${SECRETS.projectId}`); } },
  { loadAdmin: async () => ({ db: { doc: () => ({ get: async () => { throw new TypeError(SECRETS.token); } }) } }) },
  { fetchFn: async () => ({ ok: false, status: 403, text: async () => SECRETS.token }) },
  { fetchFn: async () => { throw new Error(`Bearer ${SECRETS.token}`); } },
  { env: { ...goodEnv(), PUBLIC_BASE_URL: `http://${SECRETS.dir}`, PORT: SECRETS.webhook } },
];
for (const scenario of scenarios) {
  const out = await run(scenario);
  const everything = JSON.stringify([out.results, out.lines]) + out.lines.join('\n');
  for (const value of Object.values(SECRETS)) {
    assert.ok(!everything.includes(value), `leaked ${value}`);
  }
  for (const line of out.lines) assert.match(line, /^(OK|FALTA|ERROR|AVISO)\s/);
}

console.log('doctor.test.mjs: OK');
