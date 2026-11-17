// AI-assisted: see AI_LOG.md #66
// Plain Node tests for buildBalanceView (B1, CA-005-03, CA-005-06): loading, empty, error (never 0),
// ready over more than 200 trips, and partial when the read was truncated.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { buildBalanceView } = await import('../../src/utils/balanceView.js');
const { labels } = await import('../../src/constants/labels.js');
const { fillLabel } = await import('../../src/utils/format.js');

const card = (i) => ({ id: `c${i}`, status: 'completed', paymentMethod: 'mercadopago', paymentStatus: 'approved', driverEarnings: 8000 });
const cash = (i) => ({ id: `m${i}`, status: 'paid', paymentMethod: 'cash', paymentStatus: 'paid', commission: 2000 });

test('loading and error never carry a balance (error is not 0)', () => {
  assert.equal(buildBalanceView({ status: 'loading', trips: [], truncated: false }).kind, 'loading');
  const error = buildBalanceView({ status: 'error', trips: [], truncated: false });
  assert.equal(error.kind, 'error');
  assert.notEqual(error.kind, 'ready');
});

test('C2a: no session is its own state, not loading and not a zero balance', () => {
  const view = buildBalanceView({ status: 'noSession', trips: [], truncated: false });
  assert.equal(view.kind, 'noSession');
  assert.notEqual(view.kind, 'loading');
  assert.notEqual(view.kind, 'ready');
  assert.ok(labels.earnings.balanceNoSessionTitle && labels.earnings.balanceNoSessionMessage);
});

test('ready with no trips is empty', () => {
  assert.equal(buildBalanceView({ status: 'ready', trips: [], truncated: false }).kind, 'empty');
  assert.equal(buildBalanceView({ status: 'ready', trips: undefined, truncated: false }).kind, 'empty');
});

test('250 trips: full balance, not partial', () => {
  const trips = [...Array.from({ length: 150 }, (_, i) => card(i)), ...Array.from({ length: 100 }, (_, i) => cash(i))];
  const view = buildBalanceView({ status: 'ready', trips, truncated: false });
  assert.deepEqual(view, { kind: 'ready', balance: 150 * 8000 - 100 * 2000, count: 250, partial: false });
});

test('under 200 trips the figure matches the manual calculation', () => {
  const view = buildBalanceView({ status: 'ready', trips: [card(1), card(2), cash(1)], truncated: false });
  assert.equal(view.balance, 16000 - 2000);
  assert.equal(view.partial, false);
});

test('truncated read is partial and the label carries the count', () => {
  const trips = Array.from({ length: 5000 }, (_, i) => card(i));
  const view = buildBalanceView({ status: 'ready', trips, truncated: true });
  assert.equal(view.partial, true);
  assert.equal(view.count, 5000);
  assert.equal(fillLabel(labels.earnings.balancePartial, { count: String(view.count) }), 'Saldo parcial: se leyeron los 5000 viajes más recientes.');
});
