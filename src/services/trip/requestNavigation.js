// AI-assisted: see docs/AI_LOG.md #64
// How a request is opened and how the driver comes back (D-149). Pure: no React, no navigation, no timers.
// A TAP on the push notification always opens the full-screen request from any drawer screen; an arrival
// without a tap (mock, foreground push) keeps the presentation rules of requestPresentation.js.
// The eligibility (session, approved account, trip, expiry, dedupe) is decided before, by the intent flow
// and the pending-request gate; this module only decides the PRESENTATION.

import { HOME_ROUTE, PRESENTATION, decideRequestPresentation } from './requestPresentation';

const APPROVED = 'approved';
const REQUEST_SCREEN = 'TripRequest';
const STACK_HOME = 'Home';

export const ARRIVAL = {
  TAP: 'tap',
  PASSIVE: 'passive',
};

export const OPEN_ACTION = {
  FULLSCREEN_NAVIGATE: 'fullscreen-navigate', // tap, request not shown yet: open the full screen
  PROMOTE: 'promote', // tap, request already shown (card or hidden screen): bring the full screen to the front
  FULLSCREEN: PRESENTATION.FULLSCREEN, // passive on MainHome: HomeScreen opens it as before
  CARD: PRESENTATION.CARD, // passive on another drawer screen: bottom card as before
  NONE: PRESENTATION.NONE,
};

// Drawer screen to return to when the request closes: any drawer route but the home one.
const originOf = (currentRoute) =>
  typeof currentRoute === 'string' && currentRoute !== '' && currentRoute !== HOME_ROUTE ? currentRoute : null;

// input: { arrival, currentRoute, hasSamePending, screenOpen, onTrip, accountStatus }
// returns { action, origin }
export function decideRequestOpen({ arrival, currentRoute, hasSamePending = false, screenOpen = false, onTrip = false, accountStatus }) {
  if (arrival !== ARRIVAL.TAP) {
    const presentation = decideRequestPresentation(currentRoute, onTrip, accountStatus, true, screenOpen);
    return { action: presentation, origin: null };
  }
  if (onTrip || accountStatus !== APPROVED) return { action: OPEN_ACTION.NONE, origin: null };
  // Full screen already in front: nothing to do (no duplicate).
  if (screenOpen && currentRoute === HOME_ROUTE) return { action: OPEN_ACTION.NONE, origin: null };
  const action = hasSamePending || screenOpen ? OPEN_ACTION.PROMOTE : OPEN_ACTION.FULLSCREEN_NAVIGATE;
  return { action, origin: originOf(currentRoute) };
}

// What to do with a tap intent that must still open the full screen (T-199). `offering` is true while the
// offer is still running (route lookup): the intent must survive until the offer settles, even though no
// request is pending yet.
// intent: { id, offering } | null; pendingId: id of the pending request or null.
export const OPEN_INTENT = { NONE: 'none', OPEN: 'open', WAIT: 'wait', DROP: 'drop' };
export function resolveOpenIntent(intent, pendingId) {
  if (!intent) return OPEN_INTENT.NONE;
  if (pendingId != null && pendingId === intent.id) return OPEN_INTENT.OPEN;
  if (intent.offering) return OPEN_INTENT.WAIT;
  return pendingId == null ? OPEN_INTENT.DROP : OPEN_INTENT.WAIT;
}

export const shouldNavigateToRequest =(action) =>
  action === OPEN_ACTION.FULLSCREEN_NAVIGATE || action === OPEN_ACTION.PROMOTE;

// What the request screen does when it closes without accepting. The drawer is only moved when the screen
// is in front (a request that ends while hidden must not steal the driver's current screen).
export function planLeave({ origin, focused }) {
  return { popToHome: true, drawerRoute: focused && typeof origin === 'string' && origin !== '' ? origin : null };
}

// Pure model of the navigation state, used by the tests to prove no entry accumulates.
// state: { drawerRoute, homeStack: string[], origin }
export const initialNavModel = (drawerRoute = HOME_ROUTE) => ({ drawerRoute, homeStack: [STACK_HOME], origin: null });

export function reduceNavModel(state, event) {
  switch (event.type) {
    case 'open': {
      if (!shouldNavigateToRequest(event.decision.action)) return state;
      const homeStack = state.homeStack.includes(REQUEST_SCREEN) ? state.homeStack : [...state.homeStack, REQUEST_SCREEN];
      return { drawerRoute: HOME_ROUTE, homeStack, origin: event.decision.origin };
    }
    case 'leave': {
      const plan = planLeave({ origin: state.origin, focused: event.focused !== false });
      const homeIndex = state.homeStack.indexOf(STACK_HOME);
      const homeStack = plan.popToHome ? state.homeStack.slice(0, homeIndex + 1) : state.homeStack;
      return { drawerRoute: plan.drawerRoute ?? state.drawerRoute, homeStack, origin: null };
    }
    case 'accept':
      return { drawerRoute: HOME_ROUTE, homeStack: [STACK_HOME, 'TripActive'], origin: null };
    case 'drawer':
      return { ...state, drawerRoute: event.route };
    default:
      return state;
  }
}
