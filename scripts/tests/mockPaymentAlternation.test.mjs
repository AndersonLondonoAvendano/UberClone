// AI-assisted: see docs/AI_LOG.md #74
// D-207: the app simulator alternates the payment method (cash first, then card), never drawn at random.
//   node scripts/tests/mockPaymentAlternation.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createMockPassengerApi } = await import('../../src/services/passengerApi/mockPassengerApi.js');

async function collect(randomValue, count) {
  const api = createMockPassengerApi({
    random: () => randomValue, setTimer: () => 1, clearTimer: () => {}, log: () => {},
    resolveMetrics: async (o, d, fallback) => ({ ...fallback, estimated: true }),
  });
  let emitted = null;
  api.subscribeToRequests((r) => (emitted = r), () => {}, { getDriverPosition: () => ({ lat: 6.25, lng: -75.57 }) });
  const methods = [];
  for (let i = 0; i < count; i += 1) {
    emitted = null;
    api.requestNow();
    await new Promise((resolve) => setImmediate(resolve));
    assert.ok(emitted, `request ${i} emitted`);
    methods.push(emitted.paymentMethod);
    await api.rejectRequest(emitted.id);
  }
  return methods;
}

// The sequence does not depend on the random source.
for (const value of [0, 0.5, 0.999]) {
  assert.deepEqual(await collect(value, 5), ['cash', 'card', 'cash', 'card', 'cash'], `random ${value}`);
}

console.log('mockPaymentAlternation: OK');
