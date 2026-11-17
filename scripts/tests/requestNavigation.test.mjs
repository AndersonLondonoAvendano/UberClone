// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the tap-to-fullscreen decision and the return-to-origin model (D-149).
//   node scripts/tests/requestNavigation.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const nav = await import('../../src/services/trip/requestNavigation.js');
const { HOME_ROUTE, PRESENTATION } = await import('../../src/services/trip/requestPresentation.js');
const { createPendingRequestGate } = await import('../../src/services/trip/pendingRequest.js');
const { offerPushWithArrival, PUSH_OFFER_RESULT } = await import('../../src/services/trip/pushOffer.js');
const { markShown, decisionDeadline } = await import('../../src/services/trip/decisionWindow.js');
const { ARRIVAL, OPEN_ACTION, decideRequestOpen, planLeave, initialNavModel, reduceNavModel } = nav;

const DRAWER_ROUTES = ['Profile', 'History', 'TripDetail', 'Earnings', 'Settings', 'MapTest'];
const base = { onTrip: false, accountStatus: 'approved', hasSamePending: false, screenOpen: false };

test('a tap opens the full screen from every drawer route, remembering the origin', () => {
  for (const route of DRAWER_ROUTES) {
    const r = decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: route });
    assert.deepEqual(r, { action: OPEN_ACTION.FULLSCREEN_NAVIGATE, origin: route }, route);
  }
  // TripDetail starts with "Trip": the passive rule ignores it, the tap must not.
  assert.equal(decideRequestOpen({ ...base, arrival: ARRIVAL.PASSIVE, currentRoute: 'TripDetail' }).action, OPEN_ACTION.NONE);
});

test('a tap on MainHome opens the full screen with no origin; already open is a no-op', () => {
  assert.deepEqual(
    decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: HOME_ROUTE }),
    { action: OPEN_ACTION.FULLSCREEN_NAVIGATE, origin: null },
  );
  assert.deepEqual(
    decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: HOME_ROUTE, screenOpen: true }),
    { action: OPEN_ACTION.NONE, origin: null },
  );
});

test('a tap on a request already shown as a card promotes it; a hidden open screen is brought forward', () => {
  assert.deepEqual(
    decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: 'Settings', hasSamePending: true }),
    { action: OPEN_ACTION.PROMOTE, origin: 'Settings' },
  );
  assert.deepEqual(
    decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: 'History', hasSamePending: true, screenOpen: true }),
    { action: OPEN_ACTION.PROMOTE, origin: 'History' },
  );
});

test('a tap is still ignored on a trip or without an approved account', () => {
  for (const route of [HOME_ROUTE, 'Settings']) {
    assert.equal(decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: route, onTrip: true }).action, OPEN_ACTION.NONE);
    assert.equal(decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: route, accountStatus: 'pending' }).action, OPEN_ACTION.NONE);
  }
});

test('a passive arrival keeps today rules: card elsewhere, full screen on MainHome, none otherwise', () => {
  const passive = (extra) => decideRequestOpen({ ...base, arrival: ARRIVAL.PASSIVE, ...extra });
  assert.deepEqual(passive({ currentRoute: HOME_ROUTE }), { action: PRESENTATION.FULLSCREEN, origin: null });
  for (const route of ['Profile', 'History', 'Earnings', 'Settings']) {
    assert.deepEqual(passive({ currentRoute: route }), { action: PRESENTATION.CARD, origin: null }, route);
  }
  assert.equal(passive({ currentRoute: 'Settings', screenOpen: true }).action, PRESENTATION.NONE);
  assert.equal(passive({ currentRoute: 'Settings', onTrip: true }).action, PRESENTATION.NONE);
  assert.equal(passive({ currentRoute: 'Settings', accountStatus: 'pending' }).action, PRESENTATION.NONE);
  assert.equal(passive({ currentRoute: null }).action, PRESENTATION.NONE);
  assert.equal(nav.shouldNavigateToRequest(OPEN_ACTION.CARD), false);
  assert.equal(nav.shouldNavigateToRequest(OPEN_ACTION.FULLSCREEN), false); // HomeScreen opens it as before
});

test('planLeave returns to the origin only while the screen is in front', () => {
  assert.deepEqual(planLeave({ origin: 'Settings', focused: true }), { popToHome: true, drawerRoute: 'Settings' });
  assert.deepEqual(planLeave({ origin: 'Settings', focused: false }), { popToHome: true, drawerRoute: null });
  assert.deepEqual(planLeave({ origin: null, focused: true }), { popToHome: true, drawerRoute: null });
});

test('opening, rejecting and reopening never accumulates stack entries and returns to the origin', () => {
  let state = initialNavModel('Settings');
  for (let i = 0; i < 3; i += 1) {
    const decision = decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: state.drawerRoute });
    state = reduceNavModel(state, { type: 'open', decision });
    assert.equal(state.drawerRoute, HOME_ROUTE);
    assert.deepEqual(state.homeStack, ['Home', 'TripRequest']);
    // A second tap while the screen is open (hidden or not) does not add another entry.
    state = reduceNavModel(state, { type: 'open', decision: { action: OPEN_ACTION.PROMOTE, origin: state.origin } });
    assert.deepEqual(state.homeStack, ['Home', 'TripRequest']);
    state = reduceNavModel(state, { type: 'leave', focused: true });
    assert.deepEqual(state, { drawerRoute: 'Settings', homeStack: ['Home'], origin: null });
  }
});

test('from MainHome leaving stays on MainHome; a hidden leave does not move the drawer', () => {
  let state = initialNavModel(HOME_ROUTE);
  state = reduceNavModel(state, { type: 'open', decision: decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: HOME_ROUTE }) });
  state = reduceNavModel(state, { type: 'leave', focused: true });
  assert.deepEqual(state, { drawerRoute: HOME_ROUTE, homeStack: ['Home'], origin: null });

  state = reduceNavModel(initialNavModel('History'), { type: 'open', decision: decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: 'History' }) });
  state = reduceNavModel(state, { type: 'drawer', route: 'Earnings' }); // the driver moved away: screen hidden
  state = reduceNavModel(state, { type: 'leave', focused: false });
  assert.equal(state.drawerRoute, 'Earnings');
  assert.deepEqual(state.homeStack, ['Home']);
});

test('accepting from another screen leaves the trip on MainHome and clears the origin', () => {
  let state = initialNavModel('Profile');
  state = reduceNavModel(state, { type: 'open', decision: decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: 'Profile' }) });
  state = reduceNavModel(state, { type: 'accept' });
  assert.deepEqual(state, { drawerRoute: HOME_ROUTE, homeStack: ['Home', 'TripActive'], origin: null });
});

// T-199: a tap whose offer is still refining (no pending request yet) must not be dropped, and it still opens
// the full screen once the request becomes pending.
test('open intent survives the route lookup and opens the full screen afterwards', () => {
  const { resolveOpenIntent, OPEN_INTENT } = nav;
  const refining = { id: 'p9', hasSamePending: false, offering: true };
  assert.equal(resolveOpenIntent(refining, null), OPEN_INTENT.WAIT); // the old rule dropped it here
  assert.equal(resolveOpenIntent(refining, 'p9'), OPEN_INTENT.OPEN);
  assert.equal(resolveOpenIntent({ ...refining, offering: false }, 'p9'), OPEN_INTENT.OPEN);
  assert.equal(resolveOpenIntent({ ...refining, offering: false }, null), OPEN_INTENT.DROP); // vanished after settling
  assert.equal(resolveOpenIntent(null, 'p9'), OPEN_INTENT.NONE);
  assert.equal(
    decideRequestOpen({ ...base, arrival: ARRIVAL.TAP, currentRoute: 'Earnings' }).action,
    nav.OPEN_ACTION.FULLSCREEN_NAVIGATE,
  );
});

test('promoting a pending request keeps the gate slot and the original 15 s window', () => {
  let NOW = 1_000_000;
  const timers = [];
  const gate = createPendingRequestGate({ now: () => NOW, setTimer: (fn) => timers.push(fn) && timers.length, clearTimer: () => {} });
  const request = { id: 'p1', createdAt: NOW, expiresAt: NOW + 90_000 };
  let adopts = 0;
  const adopt = () => (adopts += 1, true);
  assert.equal(offerPushWithArrival({ gate, adopt, request, now: () => NOW }), PUSH_OFFER_RESULT.OFFERED);
  markShown('p1', NOW); // the card showed it
  const timersBefore = timers.length;
  NOW += 6_000;
  // Passive duplicate: still refused (as before).
  assert.equal(offerPushWithArrival({ gate, adopt, request, now: () => NOW }), PUSH_OFFER_RESULT.REJECTED);
  // Tap on the same id: promoted, no second adopt, no new timer, same deadline.
  assert.equal(offerPushWithArrival({ gate, adopt, request, tap: true, now: () => NOW }), PUSH_OFFER_RESULT.PROMOTED);
  assert.equal(adopts, 1);
  assert.equal(timers.length, timersBefore);
  assert.equal(gate.get().id, 'p1');
  markShown('p1', NOW); // TripRequestScreen mounts and marks it again: the first instant wins
  assert.equal(decisionDeadline(request, NOW), decisionDeadline(request, NOW - 6_000));
  // Tap on an expired same id is not promoted.
  NOW = request.expiresAt + 10_001; // D-202: past the clock tolerance
  assert.notEqual(offerPushWithArrival({ gate, adopt, request, tap: true, now: () => NOW }), PUSH_OFFER_RESULT.PROMOTED);
  // Tap on another id while busy is rejected, not promoted.
  const gate2 = createPendingRequestGate({ now: () => 1000, setTimer: () => 1, clearTimer: () => {} });
  gate2.offer({ id: 'a', expiresAt: 1000 + 90_000 });
  assert.equal(
    offerPushWithArrival({ gate: gate2, adopt, request: { id: 'b', expiresAt: 1000 + 90_000 }, tap: true, now: () => 1000 }),
    PUSH_OFFER_RESULT.REJECTED,
  );
});
