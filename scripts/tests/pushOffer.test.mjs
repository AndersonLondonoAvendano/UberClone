// AI-assisted: see docs/AI_LOG.md #64
// AI-assisted: see docs/AI_LOG.md #66 (A1: the offer is shown at once and refined in the background)
// Plain Node test for offerPushThroughGate (S3 fix, D-135): gate first, adopt second, release on refusal,
// and for offerPushRefined (A1): preliminary offer -> final copy, cap, fallback, dedupe, expiry.
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

// ---- A1: offerPushRefined (shown at once with metricsPending, final copy after the route) ----
const { offerPushRefined, PUSH_OFFER_RESULT } = await import('../../src/services/trip/pushOffer.js');
const { refineRequestMetrics } = await import('../../src/services/notifications/pushRequest.js');
const { createRouteMetrics } = await import('../../src/services/routing/routeMetrics.js');
const { canDecide, decisionWindowStart, displayFare, isMetricsPending } = await import(
  '../../src/services/trip/requestMetrics.js'
);

const full = (id, extra = {}) => ({
  id, expiresAt: NOW + 90_000, distanceKm: 3.2, durationMin: 9, category: 'economico',
  passenger: { name: 'Ana' },
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

// Screen before data: the request is pending at once with the message data and `metricsPending`, the adapter
// is not touched yet, and the fare and the decision window do not exist while it is pending (R-084, D-137).
// After the route answers the final copy replaces it (same id), the adapter adopts the final copy, and only
// then the fare, the window and the buttons exist.
{
  const gate = makeGate();
  const { resolver, calls, release } = controlledResolver('ok');
  const adopted = [];
  const offered = [];
  const finals = [];
  const p = offerPushRefined({
    gate, request: full('r1'), inFlight: new Map(), now: () => NOW,
    refine: (r) => refineRequestMetrics(r, resolver),
    adopt: (r) => (adopted.push(r), true),
    onOffered: (r) => offered.push(r),
    onFinal: (r, info) => finals.push([r, info]),
  });
  // Synchronously, before any await: the screen can open.
  assert.equal(isMetricsPending(gate.get()), true);
  assert.equal(gate.get().passenger.name, 'Ana');
  assert.equal(gate.get().category, 'economico');
  assert.equal(offered.length, 1);
  await tick();
  assert.equal(adopted.length, 0);
  assert.equal(displayFare(gate.get()), null);
  assert.equal(decisionWindowStart(gate.get(), NOW), null);
  assert.equal(canDecide(gate.get()), false);

  release();
  assert.equal(await p, PUSH_OFFER_RESULT.OFFERED);
  assert.equal(isMetricsPending(gate.get()), false);
  assert.equal(gate.get().distanceKm, 8.5);
  assert.equal(gate.get().durationMin, 22);
  assert.equal(adopted.length, 1);
  assert.equal(adopted[0].distanceKm, 8.5);
  assert.equal(isMetricsPending(adopted[0]), false);
  assert.equal(finals.length, 1);
  assert.equal(finals[0][1].capped, false);
  assert.equal(calls.n, 1);
  // Window after data: it starts now, the fare exists, the buttons are active.
  assert.equal(decisionWindowStart(gate.get(), NOW + 700), NOW + 700);
  assert.notEqual(displayFare(gate.get()), null);
  assert.equal(canDecide(gate.get()), true);
  assert.equal(canDecide(gate.get(), { working: true }), false);
}

// The fare is computed only from the final copy: the fake calculator never sees the provisional numbers.
{
  const seen = [];
  const calc = (input) => (seen.push(input), { fare: 1 });
  assert.equal(displayFare({ id: 'p', metricsPending: true, distanceKm: 3.2, durationMin: 9, category: 'economico' }, calc), null);
  assert.equal(seen.length, 0);
  assert.deepEqual(displayFare({ id: 'p', distanceKm: 8.5, durationMin: 22, category: 'economico' }, calc), { fare: 1 });
  assert.deepEqual(seen, [{ distanceKm: 8.5, durationMin: 22, category: 'economico' }]);
  // A calculation error is a missing fare, never a thrown error.
  assert.equal(displayFare({ id: 'p', distanceKm: 1, durationMin: 1 }, () => { throw new Error('x'); }), null);
}

// Fallback: OSRM down -> the final copy has the message values, marked estimated.
{
  const gate = makeGate();
  const { resolver, release } = controlledResolver('fail');
  const finals = [];
  const p = offerPushRefined({
    gate, request: full('r2'), inFlight: new Map(), now: () => NOW,
    refine: (r) => refineRequestMetrics(r, resolver), adopt: () => true,
    onFinal: (r, info) => finals.push([r, info]),
  });
  await tick();
  assert.equal(isMetricsPending(gate.get()), true);
  release();
  assert.equal(await p, PUSH_OFFER_RESULT.OFFERED);
  assert.equal(gate.get().distanceKm, 3.2);
  assert.equal(gate.get().estimated, true);
  assert.equal(isMetricsPending(gate.get()), false);
  assert.equal(finals[0][1].capped, false);
}

// Cap of about 3 s: the lookup never answers; when the cap timer fires the message values are used, marked
// estimated, with no further wait. The timer is armed with exactly capMs and cleared once it settles.
{
  const gate = makeGate();
  const timers = [];
  const cleared = [];
  const adopted = [];
  const finals = [];
  const p = offerPushRefined({
    gate, request: full('r7'), inFlight: new Map(), now: () => NOW, capMs: 3000,
    refine: () => new Promise(() => {}), // never settles
    adopt: (r) => (adopted.push(r), true),
    onFinal: (r, info) => finals.push([r, info]),
    setTimer: (fn, ms) => (timers.push({ fn, ms }), timers.length),
    clearTimer: (id) => cleared.push(id),
  });
  await tick();
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 3000);
  assert.equal(isMetricsPending(gate.get()), true);
  assert.equal(adopted.length, 0);
  timers[0].fn();
  assert.equal(await p, PUSH_OFFER_RESULT.OFFERED);
  assert.equal(isMetricsPending(gate.get()), false);
  assert.equal(gate.get().estimated, true);
  assert.equal(gate.get().distanceKm, 3.2);
  assert.equal(adopted.length, 1);
  assert.equal(finals[0][1].capped, true);
  assert.deepEqual(cleared, [1]);
}

// A late answer after the cap is ignored (one adopt, one final).
{
  const gate = makeGate();
  const timers = [];
  let late = () => {};
  let adoptCalls = 0;
  const p = offerPushRefined({
    gate, request: full('r8'), inFlight: new Map(), now: () => NOW,
    refine: (r) => new Promise((resolve) => { late = () => resolve({ ...r, distanceKm: 99 }); }),
    adopt: () => (adoptCalls += 1, true),
    setTimer: (fn, ms) => (timers.push({ fn, ms }), 1), clearTimer: () => {},
  });
  await tick();
  timers[0].fn();
  assert.equal(await p, PUSH_OFFER_RESULT.OFFERED);
  late();
  await tick();
  assert.equal(adoptCalls, 1);
  assert.equal(gate.get().distanceKm, 3.2);
}

// Dedupe during the wait: two messages and a tap for the same id make ONE lookup, ONE offer, ONE adopt.
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

// A tap while the data is still calculating promotes (same id, no second slot) once the request is pending.
{
  const gate = makeGate();
  const { resolver, calls, release } = controlledResolver('ok');
  const inFlight = new Map();
  const args = (tap) => ({
    gate, request: full('r9'), inFlight, now: () => NOW, tap,
    refine: (r) => refineRequestMetrics(r, resolver), adopt: () => true,
  });
  const first = offerPushRefined(args(false));
  await tick();
  assert.equal(isMetricsPending(gate.get()), true);
  // The in-flight promise is shared: the tap does not start a second lookup.
  const tapped = offerPushRefined(args(true));
  assert.equal(tapped, first);
  release();
  await first;
  assert.equal(calls.n, 1);
}

// Expiry during the wait: the lookup outlives expiresAt, so nothing is adopted and nothing stays pending.
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

// Decided or released while calculating (driver left, gate cleared): the final copy is dropped.
{
  const gate = makeGate();
  const { resolver, release } = controlledResolver('ok');
  let adoptCalls = 0;
  const p = offerPushRefined({
    gate, request: full('r10'), inFlight: new Map(), now: () => NOW,
    refine: (r) => refineRequestMetrics(r, resolver), adopt: () => (adoptCalls += 1, true),
  });
  await tick();
  gate.release('r10');
  release();
  assert.equal(await p, PUSH_OFFER_RESULT.REJECTED);
  assert.equal(adoptCalls, 0);
  assert.equal(gate.get(), null);
}

// The component that owns the gate went away while calculating: the slot is freed, nothing is adopted.
{
  const gate = makeGate();
  let current = true;
  const { resolver, release } = controlledResolver('ok');
  let adoptCalls = 0;
  const p = offerPushRefined({
    gate, request: full('r11'), inFlight: new Map(), now: () => NOW, isCurrent: () => current,
    refine: (r) => refineRequestMetrics(r, resolver), adopt: () => (adoptCalls += 1, true),
  });
  await tick();
  current = false;
  release();
  assert.equal(await p, PUSH_OFFER_RESULT.REJECTED);
  assert.equal(adoptCalls, 0);
  assert.equal(gate.get(), null);
}

// The adapter refuses the final copy: the slot is freed and the offer is rejected.
{
  const gate = makeGate();
  const { resolver, release } = controlledResolver('ok');
  const p = offerPushRefined({
    gate, request: full('r12'), inFlight: new Map(), now: () => NOW,
    refine: (r) => refineRequestMetrics(r, resolver), adopt: () => false,
  });
  await tick();
  release();
  assert.equal(await p, PUSH_OFFER_RESULT.REJECTED);
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

// The gate keeps its expiry timer and seen ids when the pending copy is replaced.
{
  const timers = [];
  const gate = createPendingRequestGate({ now: () => NOW, setTimer: (fn, ms) => (timers.push(ms), timers.length), clearTimer: () => {} });
  gate.offer({ ...full('u1'), metricsPending: true });
  assert.equal(gate.update(full('u1', { distanceKm: 8.5 })), true);
  assert.equal(gate.get().distanceKm, 8.5);
  assert.equal(timers.length, 1);
  assert.equal(gate.update(full('other')), false);
  gate.release('u1');
  assert.equal(gate.update(full('u1')), false);
}

console.log('pushOffer tests passed');
