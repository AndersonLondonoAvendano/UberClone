// AI-assisted: see docs/AI_LOG.md #61
// Plain Node tests for reverse geocoding (D-125). No real network: fetch, clock and sleep are fakes.
// Run: node --import ./scripts/tests/helpers/registerSrcLoader.mjs scripts/tests/reverseGeocode.test.mjs
import assert from 'node:assert/strict';

const { formatAddress, createReverseGeocoder, cacheKey } = await import('../../src/services/geocoding/reverseGeocode.js');
const addresses = await import('../../src/services/geocoding/requestAddresses.js');
const { buildTripRecord, SAVED_STATUS } = await import('../../src/services/trip/tripRecord.js');
const { MOCK_ADDRESS } = await import('../../src/config/passengerApi.js');

const okResponse = (body) => ({ ok: true, json: async () => body });
const LAUREL = { address: { road: 'Calle 10', house_number: '20-30', suburb: 'Laureles' }, display_name: 'x' };

// Fake world: a virtual clock where sleep advances time, and a fetch that records its start time.
function world(handler) {
  let time = 0;
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options, at: time });
    return handler(url, options, calls.length);
  };
  const sleep = async (ms) => {
    time += ms;
  };
  return { calls, fetchImpl, sleep, now: () => time };
}

// --- formatAddress (pure) ---
assert.equal(formatAddress(LAUREL), 'Calle 10 #20-30, Laureles');
assert.equal(formatAddress({ address: { road: 'Carrera 70', neighbourhood: 'Estadio' } }), 'Carrera 70, Estadio');
assert.equal(formatAddress({ address: { road: 'Carrera 70', quarter: 'Q' } }), 'Carrera 70, Q');
assert.equal(formatAddress({ address: { road: 'Carrera 70' } }), 'Carrera 70');
assert.equal(
  formatAddress({ address: {}, display_name: 'Parque Lleras, El Poblado, Medellín, Antioquia, Colombia' }),
  'Parque Lleras, El Poblado',
);
assert.equal(formatAddress({ error: 'Unable to geocode' }), null);
assert.equal(formatAddress({}), null);
assert.equal(formatAddress(null), null);
assert.ok(formatAddress({ address: { road: 'A'.repeat(500) } }).length <= 120);

// --- request shape: URL params and headers ---
{
  const w = world(() => okResponse(LAUREL));
  const geocoder = createReverseGeocoder({ ...w });
  assert.equal(await geocoder.reverseGeocode(6.2442, -75.5812), 'Calle 10 #20-30, Laureles');
  const url = new URL(w.calls[0].url);
  assert.equal(url.origin + url.pathname, 'https://nominatim.openstreetmap.org/reverse');
  assert.equal(url.searchParams.get('format'), 'jsonv2');
  assert.equal(url.searchParams.get('accept-language'), 'es');
  assert.equal(url.searchParams.get('zoom'), '18');
  assert.equal(url.searchParams.get('lat'), '6.2442');
  assert.equal(url.searchParams.get('lon'), '-75.5812');
  assert.equal(w.calls[0].options.headers['User-Agent'], 'UberCloneConductor-ProyectoDeClase/1.0');
}

// --- cache: rounded to 4 decimals, hits do not call the network ---
{
  assert.equal(cacheKey(6.24421, -75.58119), cacheKey(6.24424, -75.58121));
  const w = world(() => okResponse(LAUREL));
  const geocoder = createReverseGeocoder({ ...w });
  await geocoder.reverseGeocode(6.24421, -75.58119);
  await geocoder.reverseGeocode(6.24424, -75.58121);
  assert.equal(w.calls.length, 1);
  await geocoder.reverseGeocode(6.2543, -75.58119);
  assert.equal(w.calls.length, 2);
}

// --- failures are not cached; a later call asks again ---
{
  let fail = true;
  const w = world(() => {
    if (fail) throw new Error('offline');
    return okResponse(LAUREL);
  });
  const geocoder = createReverseGeocoder({ ...w });
  assert.equal(await geocoder.reverseGeocode(6.1, -75.1), null);
  fail = false;
  assert.equal(await geocoder.reverseGeocode(6.1, -75.1), 'Calle 10 #20-30, Laureles');
  assert.equal(w.calls.length, 2);
}

// --- fallback to null: HTTP error, empty body, bad JSON, bad coordinates; never throws ---
{
  const cases = [
    () => ({ ok: false, status: 429, json: async () => ({}) }),
    () => okResponse({}),
    () => okResponse({ error: 'Unable to geocode' }),
    () => ({ ok: true, json: async () => { throw new Error('bad json'); } }),
    () => undefined,
  ];
  for (const handler of cases) {
    const geocoder = createReverseGeocoder({ ...world(handler) });
    assert.equal(await geocoder.reverseGeocode(6.2, -75.2), null);
  }
  const geocoder = createReverseGeocoder({ ...world(() => okResponse(LAUREL)) });
  assert.equal(await geocoder.reverseGeocode(NaN, 1), null);
  assert.equal(await geocoder.reverseGeocode(100, 1), null);
}

// --- in-flight dedup ---
{
  const w = world(() => okResponse(LAUREL));
  const geocoder = createReverseGeocoder({ ...w });
  const [a, b] = await Promise.all([geocoder.reverseGeocode(6.3, -75.3), geocoder.reverseGeocode(6.3, -75.3)]);
  assert.equal(a, b);
  assert.equal(w.calls.length, 1);
}

// --- 1 request per second: N simultaneous calls are separated by >= 1.1 s ---
{
  const w = world(() => okResponse(LAUREL));
  const geocoder = createReverseGeocoder({ ...w });
  const results = await Promise.all(
    [0, 1, 2, 3, 4].map((i) => geocoder.reverseGeocode(6.1 + i * 0.01, -75.5)),
  );
  assert.ok(results.every((value) => value === 'Calle 10 #20-30, Laureles'));
  assert.equal(w.calls.length, 5);
  for (let i = 1; i < w.calls.length; i += 1) {
    assert.ok(w.calls[i].at - w.calls[i - 1].at >= 1100, `gap ${i}: ${w.calls[i].at - w.calls[i - 1].at}`);
  }
  assert.equal(w.calls[0].at, 0); // the first one does not wait
}

// --- a failing request does not break the queue or the spacing ---
{
  const w = world((url, options, n) => {
    if (n === 1) throw new Error('boom');
    return okResponse(LAUREL);
  });
  const geocoder = createReverseGeocoder({ ...w });
  const [a, b] = await Promise.all([geocoder.reverseGeocode(6.5, -75.5), geocoder.reverseGeocode(6.6, -75.5)]);
  assert.equal(a, null);
  assert.equal(b, 'Calle 10 #20-30, Laureles');
  assert.ok(w.calls[1].at - w.calls[0].at >= 1100);
}

// --- timeout: AbortController aborts a request that never answers ---
{
  let aborted = false;
  const hanging = (url, options) =>
    new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        aborted = true;
        reject(new Error('aborted'));
      });
    });
  const geocoder = createReverseGeocoder({ fetchImpl: hanging, timeoutMs: 30, sleep: async () => {} });
  const started = Date.now();
  assert.equal(await geocoder.reverseGeocode(6.7, -75.7), null);
  assert.ok(aborted);
  assert.ok(Date.now() - started < 1000);
}

// --- requestAddresses: background resolution, fallback, retry, saved text ---
{
  const request = {
    id: 'mock-1',
    passenger: { name: 'Lucía' },
    origin: { lat: 6.25, lng: -75.57, address: MOCK_ADDRESS },
    destination: { lat: 6.27, lng: -75.59, address: MOCK_ADDRESS },
    distanceKm: 3,
    durationMin: 10,
    category: 'economico',
    paymentMethod: 'cash',
  };
  const answers = new Map([['6.27', null]]);
  let attempt = 0;
  addresses.clearAddressesForTest();
  addresses.setGeocoderForTest(async (lat) => {
    attempt += 1;
    if (lat === 6.25) return 'Calle 10 #20-30, Laureles';
    return answers.get('6.27');
  });
  let notified = 0;
  const off = addresses.subscribeAddresses(() => {
    notified += 1;
  });
  addresses.resolveRequestAddresses(request);
  // Right after the request arrives nothing is resolved yet: both places are pending.
  assert.equal(addresses.addressState(request, 'origin').status, 'pending');
  assert.equal(addresses.withResolvedAddresses(request).origin.address, MOCK_ADDRESS);
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(addresses.addressState(request, 'origin').status, 'resolved');
  assert.equal(addresses.addressState(request, 'destination').status, 'failed');
  assert.ok(notified >= 2);
  const merged = addresses.withResolvedAddresses(request);
  assert.equal(merged.origin.address, 'Calle 10 #20-30, Laureles');
  assert.equal(merged.destination.address, MOCK_ADDRESS); // offline fallback keeps the simulated text
  assert.equal(request.origin.address, MOCK_ADDRESS); // the original is not mutated
  // Idempotent: the same request id does not start again.
  const before = attempt;
  addresses.resolveRequestAddresses(request);
  assert.equal(attempt, before);
  // One retry once the service answers.
  answers.set('6.27', 'Carrera 70 #1-2, Estadio');
  await addresses.retryMissingAddresses(request);
  assert.equal(addresses.withResolvedAddresses(request).destination.address, 'Carrera 70 #1-2, Estadio');
  // The saved record carries the resolved text (original labels untouched otherwise).
  const record = buildTripRecord({
    driverId: 'd1',
    tripId: 't1',
    request: addresses.withResolvedAddresses(request),
    status: SAVED_STATUS.COMPLETED,
    finishedAt: 1,
  });
  assert.equal(record.originLabel, 'Calle 10 #20-30, Laureles');
  assert.equal(record.destinationLabel, 'Carrera 70 #1-2, Estadio');
  assert.ok(record.originLabel.length <= 200);
  // A request with a real address is not geocoded.
  const real = { ...request, id: 'real-1', origin: { ...request.origin, address: 'Cra 1 #2-3' }, destination: { ...request.destination, address: 'Cra 4 #5-6' } };
  const calls = attempt;
  addresses.resolveRequestAddresses(real);
  assert.equal(attempt, calls);
  assert.equal(addresses.withResolvedAddresses(real).origin.address, 'Cra 1 #2-3');
  off();
  addresses.setGeocoderForTest(null);
}

console.log('reverseGeocode.test.mjs OK');
