// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for offerPushThroughGate (S3 fix, D-135): gate first, adopt second, release on refusal.
//   node scripts/tests/pushOffer.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createPendingRequestGate } = await import('../../src/services/trip/pendingRequest.js');
const { offerPushThroughGate } = await import('../../src/services/trip/pushOffer.js');

const NOW = 1000;
const makeGate = () =>
  createPendingRequestGate({ now: () => NOW, setTimer: () => 1, clearTimer: () => {} });
const req = (id) => ({ id, expiresAt: NOW + 90000 });

// Adopted: becomes pending.
{
  const gate = makeGate();
  const calls = [];
  const ok = offerPushThroughGate({ gate, request: req('a'), adopt: (r) => (calls.push(r.id), true) });
  assert.equal(ok, true);
  assert.deepEqual(calls, ['a']);
  assert.equal(gate.get().id, 'a');
}

// Duplicate: the adapter is never touched.
{
  const gate = makeGate();
  gate.offer(req('a'));
  gate.release('a');
  let adoptCalls = 0;
  const ok = offerPushThroughGate({ gate, request: req('a'), adopt: () => (adoptCalls += 1, true) });
  assert.equal(ok, false);
  assert.equal(adoptCalls, 0);
  assert.equal(gate.get(), null);
}

// Adapter refuses: the gate slot is released and nothing stays pending.
{
  const gate = makeGate();
  const ok = offerPushThroughGate({ gate, request: req('b'), adopt: () => false });
  assert.equal(ok, false);
  assert.equal(gate.get(), null);
}

// Adapter throws: same as a refusal.
{
  const gate = makeGate();
  const ok = offerPushThroughGate({
    gate,
    request: req('c'),
    adopt: () => {
      throw new Error('boom');
    },
  });
  assert.equal(ok, false);
  assert.equal(gate.get(), null);
}

// Another request pending (busy gate): adopt is not called.
{
  const gate = makeGate();
  gate.offer(req('x'));
  let adoptCalls = 0;
  const ok = offerPushThroughGate({ gate, request: req('y'), adopt: () => (adoptCalls += 1, true) });
  assert.equal(ok, false);
  assert.equal(adoptCalls, 0);
  assert.equal(gate.get().id, 'x');
}

// ---- T-199: offerPushRefined (refine before the gate, dedupe and expiry during the wait) ----
const { offerPushRefined, PUSH_OFFER_RESULT } = await import('../../src/services/trip/pushOffer.js');
const { refineRequestMetrics } = await import('../../src/services/notifications/pushRequest.js');
const { createRouteMetrics } = await import('../../src/services/routing/routeMetrics.js');

const full = (id, extra = {}) => ({
  id, expiresAt: NOW + 90_000, distanceKm: 3.2, durationMin: 9,
  origin: { lat: 6.25, lng: -75.56 }, destination: { lat: 6.26, lng: -75.55 }, ...extra,
});
// Real resolver with a fake fetch under manual control: counts OSRM calls, answers when released.
function controlledResolver(outcome) {
  const calls = { n: 0 };
  let release = () => {};
  const resolver = createRouteMetrics({
    fetchRoute: () => {
      calls.n += 1;
      return new Promise((resolve, reject) => {
        release = () => (outcome === 'ok' ? resolve({ distanceM: 8500, durationS: 1320 }) : reject(new Error('down')));
      });
    },
    setTimer: () => 1,
    clearTimer: () => {},
  });
  return { resolver, calls, release: () => release() };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

// Refined before it is shown: the gate and the adapter get the OSRM values.
{
  const gate = makeGate();
  const { resolver, calls, release } = controlledResolver('ok');
  const adopted = [];
  const p = offerPushRefined({
    gate, request: full('r1'), inFlight: new Map(), now: () => NOW,
    refine: (r) => refineRequestMetrics(r, resolver),
    adopt: (r) => (adopted.push(r), true),
  });
  await tick();
  assert.equal(gate.get(), null); // nothing shown while the lookup runs
  release();
  assert.equal(await p, PUSH_OFFER_RESULT.OFFERED);
  assert.equal(gate.get().distanceKm, 8.5);
  assert.equal(gate.get().durationMin, 22);
  assert.equal(adopted[0].distanceKm, 8.5);
  assert.equal(calls.n, 1);
}

// OSRM down: offered with the message values, marked estimated.
{
  const gate = makeGate();
  const { resolver, release } = controlledResolver('fail');
  const p = offerPushRefined({
    gate, request: full('r2'), inFlight: new Map(), now: () => NOW,
    refine: (r) => refineRequestMetrics(r, resolver), adopt: () => true,
  });
  await tick();
  release();
  assert.equal(await p, PUSH_OFFER_RESULT.OFFERED);
  assert.equal(gate.get().distanceKm, 3.2);
  assert.equal(gate.get().estimated, true);
}

// Dedupe during the wait: two messages and a tap for the same id make ONE lookup and ONE offer.
{
  const gate = makeGate();
  const { resolver, calls, release } = controlledResolver('ok');
  const inFlight = new Map();
  let adoptCalls = 0;
  let offeredCalls = 0;
  const args = (tap) => ({
    gate, request: full('r3'), inFlight, now: () => NOW, tap,
    refine: (r) => refineRequestMetrics(r, resolver),
    adopt: () => (adoptCalls += 1, true), onOffered: () => (offeredCalls += 1),
  });
  const a = offerPushRefined(args(false));
  const b = offerPushRefined(args(false));
  const c = offerPushRefined(args(true));
  await tick();
  release();
  assert.deepEqual(await Promise.all([a, b, c]), Array(3).fill(PUSH_OFFER_RESULT.OFFERED));
  assert.equal(calls.n, 1);
  assert.equal(adoptCalls, 1);
  assert.equal(offeredCalls, 1);
  assert.equal(inFlight.size, 0);
  // After it settled, a tap on the pending request is a promotion with no new lookup.
  assert.equal(await offerPushRefined(args(true)), PUSH_OFFER_RESULT.PROMOTED);
  assert.equal(calls.n, 1);
}

// Expiry during the wait: the lookup outlives expiresAt, so nothing is offered or adopted.
{
  let clock = NOW;
  const gate = createPendingRequestGate({ now: () => clock, setTimer: () => 1, clearTimer: () => {} });
  const { resolver, release } = controlledResolver('ok');
  let adoptCalls = 0;
  const p = offerPushRefined({
    gate, request: full('r4', { expiresAt: NOW + 2000 }), inFlight: new Map(), now: () => clock,
    refine: (r) => refineRequestMetrics(r, resolver), adopt: () => (adoptCalls += 1, true),
  });
  await tick();
  clock = NOW + 2500;
  release();
  assert.equal(await p, PUSH_OFFER_RESULT.EXPIRED);
  assert.equal(adoptCalls, 0);
  assert.equal(gate.get(), null);
}

// Already expired on arrival: no lookup at all. Busy gate: no lookup either.
{
  const gate = makeGate();
  let refines = 0;
  const refine = async (r) => (refines += 1, r);
  assert.equal(
    await offerPushRefined({ gate, request: full('r5', { expiresAt: NOW - 1 }), inFlight: new Map(), now: () => NOW, refine, adopt: () => true }),
    PUSH_OFFER_RESULT.EXPIRED,
  );
  gate.offer(req('x'));
  assert.equal(
    await offerPushRefined({ gate, request: full('r6'), inFlight: new Map(), now: () => NOW, refine, adopt: () => true }),
    PUSH_OFFER_RESULT.REJECTED,
  );
  assert.equal(refines, 0);
}

console.log('pushOffer tests passed');
