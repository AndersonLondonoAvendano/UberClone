// AI-assisted: see docs/AI_LOG.md #73
// T-294 (D-202, D-203): request validity with an injected clock, full decision window on adoption, no
// release before the final data, dedupe, one notice, "Disponible" restore without a second adoption, and
// "taken by another driver" never on a push request nor before MOCK_TAKEN_MIN_DECISION_MS.
//   node --test scripts/tests/requestValidity.test.mjs
import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { isRequestExpired, effectiveExpiry } = await import('../../src/services/trip/requestValidity.js');
const { REQUEST_CLOCK_TOLERANCE_MS } = await import('../../src/config/trip.js');
const passengerConfig = await import('../../src/config/passengerApi.js');
const { createPendingRequestGate } = await import('../../src/services/trip/pendingRequest.js');
const { offerPushRefined, PUSH_OFFER_RESULT } = await import('../../src/services/trip/pushOffer.js');
const { createDecisionWindow } = await import('../../src/services/trip/decisionWindow.js');
const { resolveShownRequest, withMetricsPending } = await import('../../src/services/trip/requestMetrics.js');
const { declineRequest, resetDeclineStateForTest, DECLINE_RESULT, DECLINE_REASON } = await import('../../src/services/trip/declineRequest.js');
const { requestFromIntent, parsePushRequest, PARSE_REASON } = await import('../../src/services/notifications/pushRequest.js');
const { createIntentFlow, FLOW_RESULT } = await import('../../src/services/notifications/intentFlow.js');
const { createPendingIntent } = await import('../../src/services/notifications/pendingIntent.js');
const { mergeNotice } = await import('../../src/services/notifications/eligibility.js');
const { createMockPassengerApi } = await import('../../src/services/passengerApi/mockPassengerApi.js');
const { PASSENGER_API_ERROR } = await import('../../src/services/passengerApi/contract.js');
const { ACCOUNT_STATUS } = await import('../../src/constants/accountStatus.js');

const { MOCK_TAKEN_MIN_DECISION_MS } = passengerConfig;
const WINDOW = passengerConfig.REQUEST_DECISION_WINDOW_MS;
const NOW = 1_700_000_000_000;
const TOL = REQUEST_CLOCK_TOLERANCE_MS;
const intent = (extra = {}) => ({
  targetUid: 'A', requestId: 'r1', expiresAt: NOW + 90_000, category: 'economico', distanceKm: 3, durationMin: 9,
  origin: { lat: 6.25, lng: -75.56 }, destination: { lat: 6.26, lng: -75.55 }, passengerName: 'Ana', ...extra,
});
const pushData = (extra = {}) => ({
  type: 'trip_request', requestId: 'c1', targetUid: 'A', expiresAt: String(NOW + 90_000), category: 'economico',
  distanceKm: '3', durationMin: '9', originLat: '6.25', originLng: '-75.56', destLat: '6.26', destLng: '-75.55',
  passengerName: 'Ana', ...extra,
});
const flush = () => new Promise((resolve) => setImmediate(resolve));
const makeGate = (clock) => createPendingRequestGate({ now: clock, setTimer: () => 1, clearTimer: () => {} });

beforeEach(resetDeclineStateForTest);

test('tolerance works in both directions around expiresAt', () => {
  assert.equal(isRequestExpired(NOW, NOW - 60_000), false); // phone clock behind: never expired
  assert.equal(isRequestExpired(NOW, NOW), false);
  assert.equal(isRequestExpired(NOW, NOW + TOL - 1), false); // phone clock ahead by less than the tolerance
  assert.equal(isRequestExpired(NOW, NOW + TOL), true);
  assert.equal(isRequestExpired(NOW, NOW + TOL + 5000), true);
  assert.equal(isRequestExpired('x', NOW), true);
  assert.equal(isRequestExpired(NOW, NaN), true);
});

test('effectiveExpiry never leaves less than the full decision window', () => {
  assert.equal(effectiveExpiry(NOW + 90_000, NOW), NOW + 90_000);
  assert.equal(effectiveExpiry(NOW + 2000, NOW), NOW + WINDOW);
  assert.equal(effectiveExpiry(NOW - 5000, NOW), NOW + WINDOW);
});

test('cold start with a request inside its validity: full 15 s window from the final data', async () => {
  let clock = NOW;
  const parsed = parsePushRequest(pushData({ expiresAt: String(NOW + 2000) }), { now: NOW });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.request.expiresAt, NOW + WINDOW);

  const gate = makeGate(() => clock);
  const adopted = [];
  const result = await offerPushRefined({
    gate, request: parsed.request, inFlight: new Map(), now: () => clock, log: () => {},
    refine: async (r) => { clock += 3000; return { ...r, distanceKm: 5 }; }, // the route lookup takes 3 s
    adopt: (r) => { adopted.push(r); return true; },
  });
  assert.equal(result, PUSH_OFFER_RESULT.OFFERED);
  const final = gate.get();
  assert.equal(final.metricsPending, undefined);
  assert.ok(final.expiresAt >= clock + WINDOW, 'the final copy has its full window');
  const window = createDecisionWindow();
  window.markShown(final.id, clock);
  assert.equal(window.remainingMs(final, clock), WINDOW);
  assert.equal(adopted.length, 1);
});

test('really expired (validity + tolerance passed): expired, nothing adopted, nothing pending', async () => {
  assert.deepEqual(
    parsePushRequest(pushData({ expiresAt: String(NOW - TOL) }), { now: NOW }),
    { ok: false, reason: PARSE_REASON.EXPIRED },
  );
  const gate = makeGate(() => NOW);
  let adopts = 0;
  const request = { ...requestFromIntent(intent(), NOW), expiresAt: NOW - TOL };
  const result = await offerPushRefined({
    gate, request, inFlight: new Map(), now: () => NOW, log: () => {}, refine: async (r) => r,
    adopt: () => { adopts += 1; return true; },
  });
  assert.equal(result, PUSH_OFFER_RESULT.EXPIRED);
  assert.equal(adopts, 0);
  assert.equal(gate.get(), null);
});

test('no release or decline before the final data exists', async () => {
  const pendingCopy = withMetricsPending(requestFromIntent(intent(), NOW));
  const released = [];
  const saved = [];
  const reject = async (id) => { released.push(id); };
  const save = async (uid, id) => { saved.push(id); };
  assert.equal(
    await declineRequest({ uid: 'A', request: pendingCopy, reason: DECLINE_REASON.REJECTED, save, reject }),
    DECLINE_RESULT.SKIPPED,
  );
  assert.deepEqual(released, []);
  assert.deepEqual(saved, []);
  // The id was not burned: with the final data the same request is declined once.
  const { metricsPending, ...finalCopy } = pendingCopy;
  assert.equal(metricsPending, true);
  assert.equal(await declineRequest({ uid: 'A', request: finalCopy, save, reject }), DECLINE_RESULT.SAVED);
  assert.equal(await declineRequest({ uid: 'A', request: finalCopy, save, reject }), DECLINE_RESULT.SKIPPED);
  assert.deepEqual(released, ['r1']);
  assert.deepEqual(saved, ['r1']);
});

test('dedupe: two messages for the same id adopt once; a seen id is not offered again', async () => {
  const gate = makeGate(() => NOW);
  const inFlight = new Map();
  let adopts = 0;
  const base = {
    gate, inFlight, now: () => NOW, log: () => {},
    refine: async (r) => { await flush(); return r; },
    adopt: () => { adopts += 1; return true; },
  };
  const request = requestFromIntent(intent({ requestId: 'd1' }), NOW);
  const first = offerPushRefined({ ...base, request });
  const second = offerPushRefined({ ...base, request });
  assert.equal(first, second, 'the second call joins the same promise');
  assert.equal(await first, PUSH_OFFER_RESULT.OFFERED);
  assert.equal(adopts, 1);
  gate.release('d1');
  assert.equal(await offerPushRefined({ ...base, request }), PUSH_OFFER_RESULT.REJECTED);
  assert.equal(adopts, 1);
});

test('the screen keeps the last final copy: no notice over skeletons, one notice per request', () => {
  const opened = withMetricsPending(requestFromIntent(intent(), NOW));
  const { metricsPending, ...final } = opened;
  assert.equal(metricsPending, true);
  let step = resolveShownRequest({ opened, pending: opened, lastFinal: null });
  assert.equal(step.request.metricsPending, true, 'before data the opening copy is shown');
  step = resolveShownRequest({ opened, pending: final, lastFinal: step.lastFinal });
  assert.equal(step.request, final);
  step = resolveShownRequest({ opened, pending: null, lastFinal: step.lastFinal }); // slot released
  assert.equal(step.request, final);
  assert.equal(step.request.metricsPending, undefined);
  step = resolveShownRequest({ opened, pending: { ...final, id: 'other' }, lastFinal: step.lastFinal });
  assert.equal(step.request, final, 'a foreign pending request never replaces it');
  assert.equal(mergeNotice(mergeNotice(null, 'La solicitud expiró'), 'Otro conductor tomó'), 'La solicitud expiró');
});

test('restoring "Disponible" does not adopt the intent twice', async () => {
  const intents = createPendingIntent();
  assert.equal(intents.set(intent()), true);
  const state = { uid: 'A', accountStatus: ACCOUNT_STATUS.APPROVED, onTrip: false, available: 'restoring' };
  const offered = [];
  const timers = [];
  const flow = createIntentFlow({
    intents, getState: () => state, offer: (r) => { offered.push(r.id); return true; }, showExpired: () => {},
    now: () => NOW, awaitAvailabilityMs: 3000, setTimeoutFn: (fn) => { timers.push(fn); return timers.length; },
    clearTimeoutFn: () => {},
  });
  assert.equal(await flow.evaluate(), FLOW_RESULT.WAITING);
  assert.equal(offered.length, 0);
  state.available = 'available';
  assert.equal(await flow.evaluate(), FLOW_RESULT.ADOPTED);
  assert.equal(await flow.evaluate(), FLOW_RESULT.NONE);
  timers.forEach((fn) => fn()); // a late wait timer finds nothing left to adopt
  await flush();
  assert.deepEqual(offered, ['r1']);
});

// Simulated passenger: random() = 0 with probability 1 would take EVERY accept if it were allowed.
function makeMock() {
  let t = NOW;
  const api = createMockPassengerApi({
    now: () => t, random: () => 0, alreadyTakenProbability: 1, log: () => {},
    setTimer: () => 1, clearTimer: () => {},
    resolveMetrics: async (o, d, fallback) => fallback,
  });
  return { api, advance: (ms) => { t += ms; } };
}

test('"taken by another driver" never applies to an adopted (push) request', async () => {
  const { api, advance } = makeMock();
  api.adoptRequest(requestFromIntent(intent({ requestId: 'p1' }), NOW));
  advance(MOCK_TAKEN_MIN_DECISION_MS + 1000);
  const trip = await api.acceptRequest('p1');
  assert.equal(trip.id, 'p1');
});

test('"taken by another driver" on a simulator request only after MOCK_TAKEN_MIN_DECISION_MS', async () => {
  for (const [wait, taken] of [[0, false], [MOCK_TAKEN_MIN_DECISION_MS - 1, false], [MOCK_TAKEN_MIN_DECISION_MS, true]]) {
    const { api, advance } = makeMock();
    const seen = [];
    api.subscribeToRequests((r) => seen.push(r), () => {}, { getDriverPosition: () => ({ lat: 6.25, lng: -75.56 }) });
    api.requestNow();
    await flush();
    assert.equal(seen.length, 1);
    advance(wait);
    if (taken) {
      await assert.rejects(api.acceptRequest(seen[0].id), (e) => e.code === PASSENGER_API_ERROR.ALREADY_TAKEN);
    } else {
      assert.equal((await api.acceptRequest(seen[0].id)).id, seen[0].id);
    }
  }
});
