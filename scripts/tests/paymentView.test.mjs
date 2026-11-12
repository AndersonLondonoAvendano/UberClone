// AI-assisted: see docs/AI_LOG.md #55
// Plain Node tests for paymentView (CA-002-69, pure part). Run:
//   node scripts/tests/paymentView.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { paymentView } = await import('../../src/services/trip/paymentView.js');
const { labels } = await import('../../src/constants/labels.js');

const mp = (paymentStatus, status = 'completed') => ({ paymentMethod: 'mercadopago', paymentStatus, status });
const cash = (paymentStatus, status = 'completed') => ({ paymentMethod: 'cash', paymentStatus, status });

assert.deepEqual(paymentView(mp('pending')), { chip: 'pending', actions: ['charge', 'verify'] });
assert.deepEqual(paymentView(mp(undefined)), { chip: 'pending', actions: ['charge', 'verify'] });
assert.deepEqual(paymentView(mp('rejected')), { chip: 'rejected', actions: ['retry', 'verify'] });
assert.deepEqual(paymentView(mp('approved', 'paid')), { chip: 'approved', actions: [] });
assert.deepEqual(paymentView(mp('approved')), { chip: 'approved', actions: [] });
assert.deepEqual(paymentView(cash('pending')), { chip: 'cash', actions: ['confirmCash'] });
assert.deepEqual(paymentView(cash('paid', 'paid')), { chip: 'cash', actions: [] });

// Legacy, missing, cancelled and absent: unavailable, never an action that charges.
for (const trip of [
  { paymentMethod: 'transfer', status: 'completed' },
  { paymentMethod: 'none', status: 'cancelled' },
  { status: 'completed' },
  { paymentMethod: 'cash', status: 'cancelled', paymentStatus: 'pending' },
  mp('pending', 'cancelled'),
  null,
  undefined,
  'x',
]) {
  assert.deepEqual(paymentView(trip), { chip: 'unavailable', actions: [] }, JSON.stringify(trip));
}

// Every chip and action has a text in labels.js.
const chips = new Set(['approved', 'pending', 'rejected', 'cash', 'unavailable']);
chips.forEach((chip) => assert.equal(typeof labels.trip.paymentChip[chip], 'string', chip));
['charge', 'retry', 'verify', 'confirmCash'].forEach((a) => assert.equal(typeof labels.trip.paymentAction[a], 'string', a));

console.log('paymentView: OK');
