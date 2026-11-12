// AI-assisted: see docs/AI_LOG.md #55
// Plain Node tests for the charge action runner (T-97). Simulated services, no network or Firebase.
//   node --import ./scripts/tests/helpers/registerSrcLoader.mjs --test scripts/tests/paymentActions.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/registerSrcLoader.mjs';

const { createPaymentActions, ACTION_ERROR } = await import('../../src/services/trip/paymentActions.js');
const { PAYMENT_ACTION } = await import('../../src/services/trip/paymentView.js');

function make(over = {}) {
  const calls = [];
  const actions = createPaymentActions({
    requestCheckoutUrl: async (id) => { calls.push(['checkout', id]); return { ok: true, url: 'https://mp.test/pay' }; },
    syncPayment: async (id) => { calls.push(['sync', id]); return { ok: true, paymentStatus: 'approved' }; },
    confirmCashPayment: async (uid, id) => { calls.push(['cash', uid, id]); },
    openUrl: async (url) => { calls.push(['open', url]); },
    ...over,
  });
  return { actions, calls };
}
const ctx = { uid: 'u1', tripId: 't1' };

// Charge and retry request the link and open it; nothing is written.
for (const action of [PAYMENT_ACTION.CHARGE, PAYMENT_ACTION.RETRY]) {
  const { actions, calls } = make();
  assert.deepEqual(await actions.run(action, ctx), { ok: true });
  assert.deepEqual(calls, [['checkout', 't1'], ['open', 'https://mp.test/pay']]);
}

// Backend errors map to the three client errors; the browser is not opened.
for (const error of ['offline', 'backendUnavailable', 'failed']) {
  const { actions, calls } = make({ requestCheckoutUrl: async () => ({ ok: false, error }) });
  assert.deepEqual(await actions.run(PAYMENT_ACTION.CHARGE, ctx), { ok: false, error });
  assert.equal(calls.length, 0);
}
{
  const { actions } = make({ openUrl: async () => { throw new Error('no browser'); } });
  assert.deepEqual(await actions.run(PAYMENT_ACTION.CHARGE, ctx), { ok: false, error: ACTION_ERROR.OPEN_FAILED });
  assert.equal(actions.isBusy(), false);
}

// Double tap: a single request in flight; the lock is released afterwards.
{
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  let requests = 0;
  const { actions } = make({ requestCheckoutUrl: async () => { requests += 1; await gate; return { ok: true, url: 'https://mp.test/pay' }; } });
  const first = actions.run(PAYMENT_ACTION.CHARGE, ctx);
  assert.equal(actions.isBusy(), true);
  assert.deepEqual(await actions.run(PAYMENT_ACTION.CHARGE, ctx), { skipped: true });
  assert.deepEqual(await actions.run(PAYMENT_ACTION.VERIFY, ctx), { skipped: true });
  release();
  assert.deepEqual(await first, { ok: true });
  assert.equal(requests, 1);
  assert.equal(actions.isBusy(), false);
  assert.deepEqual(await actions.run(PAYMENT_ACTION.CHARGE, ctx), { ok: true });
  assert.equal(requests, 2);
}

// Verify: ok does not carry a paid verdict (only the document decides); errors are mapped.
{
  const { actions, calls } = make();
  assert.deepEqual(await actions.run(PAYMENT_ACTION.VERIFY, ctx), { ok: true });
  assert.deepEqual(calls, [['sync', 't1']]);
  const bad = make({ syncPayment: async () => ({ ok: false, error: 'weird' }) });
  assert.deepEqual(await bad.actions.run(PAYMENT_ACTION.VERIFY, ctx), { ok: false, error: 'failed' });
}

// Cash: uses confirmCashPayment(uid, tripId); a rejection is CASH_FAILED and never throws.
{
  const { actions, calls } = make();
  assert.deepEqual(await actions.run(PAYMENT_ACTION.CONFIRM_CASH, ctx), { ok: true });
  assert.deepEqual(calls, [['cash', 'u1', 't1']]);
  const bad = make({ confirmCashPayment: async () => { throw new Error('denied'); } });
  assert.deepEqual(await bad.actions.run(PAYMENT_ACTION.CONFIRM_CASH, ctx), { ok: false, error: ACTION_ERROR.CASH_FAILED });
  assert.deepEqual(await bad.actions.run(PAYMENT_ACTION.CONFIRM_CASH, { uid: null, tripId: 't1' }), { ok: false, error: ACTION_ERROR.CASH_FAILED });
  assert.equal(bad.actions.isBusy(), false);
}

// Unknown action or missing trip: failed, nothing called.
{
  const { actions, calls } = make();
  assert.equal((await actions.run('nope', ctx)).ok, false);
  assert.equal((await actions.run(PAYMENT_ACTION.CHARGE, { uid: 'u1', tripId: null })).ok, false);
  assert.equal(calls.length, 0);
}

// Static guards on the screen: no Alert, no card payment write, AppState listener removed, openURL used.
{
  const screen = readFileSync(new URL('../../src/screens/trip/TripSummaryScreen.js', import.meta.url), 'utf8');
  const runner = readFileSync(new URL('../../src/services/trip/paymentActions.js', import.meta.url), 'utf8');
  assert.ok(!/Alert\.alert|import[^;]*\bAlert\b/.test(screen));
  assert.ok(/AppState\.addEventListener\('change'/.test(screen));
  assert.ok(/subscription\.remove\(\)/.test(screen));
  assert.ok(/Linking\.openURL/.test(screen));
  assert.ok(!/status:\s*(TRIP_STATUS|PAYMENT_STATUS)\.(PAID|APPROVED)/.test(screen + runner));
  assert.ok(!/updateDoc|setDoc/.test(screen + runner));
}

console.log('paymentActions tests passed');
