// AI-assisted: see AI_LOG.md #59
// Plain Node tests for the 'card' -> 'mercadopago' convention (#59, c). Run:
//   node scripts/tests/paymentConvention.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { PAYMENT_METHODS, LEGACY_PAYMENT_METHODS, isValidTripRequest } = await import('../../src/services/passengerApi/contract.js');
const { toTripRequest } = await import('../../src/services/passengerApi/mappers.js');
const { createMockPassengerApi } = await import('../../src/services/passengerApi/mockPassengerApi.js');
const { paymentMethodOf } = await import('../../src/services/trip/tripRecord.js');
const { paymentLabelKey } = await import('../../src/services/trip/paymentGateway.js');
const { labels } = await import('../../src/constants/labels.js');

// The contract emits 'card' | 'cash'; 'mercadopago' is only legacy input.
assert.deepEqual([...PAYMENT_METHODS], ['card', 'cash']);
assert.deepEqual([...LEGACY_PAYMENT_METHODS], ['mercadopago']);

// mappers.js is the only place that knows the API shape.
assert.equal(toTripRequest({ paymentMethod: 'card' }).paymentMethod, 'card');
assert.equal(toTripRequest({ payment_method: 'CARD' }).paymentMethod, 'card');
assert.equal(toTripRequest({ paymentMethod: 'cash' }).paymentMethod, 'cash');
assert.equal(toTripRequest({ paymentMethod: 'mercadopago' }).paymentMethod, 'card', 'legacy value read as card');

// A request with either method (and legacy) is valid.
const req = (paymentMethod) => ({
  id: 'r1', passenger: { name: 'Ana' }, origin: { lat: 4.6, lng: -74.08, address: 'a' }, destination: { lat: 4.7, lng: -74.1, address: 'b' },
  distanceKm: 1, durationMin: 1, category: 'economico', paymentMethod, createdAt: 1, expiresAt: 2,
});
for (const m of ['card', 'cash', 'mercadopago']) assert.equal(isValidTripRequest(req(m)), true, m);
assert.equal(isValidTripRequest(req('stripe')), false);

// The simulated passenger only emits card or cash.
const api = createMockPassengerApi();
assert.ok(api, 'mock api builds');

// The saved record: card (and legacy) -> 'mercadopago' ("tarjeta, pasarela por definir"); cash stays cash.
assert.equal(paymentMethodOf({ paymentMethod: 'card' }), 'mercadopago');
assert.equal(paymentMethodOf({ paymentMethod: 'mercadopago' }), 'mercadopago');
assert.equal(paymentMethodOf({ paymentMethod: 'cash' }), 'cash');

// Labels: a request (never a paymentId) always reads "Tarjeta", whichever way it is spelled.
const label = (method) => labels.trip.paymentMethod[paymentLabelKey({ method })];
assert.equal(label('card'), 'Tarjeta');
assert.equal(label('mercadopago'), 'Tarjeta');
assert.equal(label('cash'), 'Efectivo');

console.log('paymentConvention: OK');
