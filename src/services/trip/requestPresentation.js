// AI-assisted: see AI_LOG.md #47
// AI-assisted: see AI_LOG.md #49
// AI-assisted: see AI_LOG.md #64 (the drawer route is MainHome so it no longer repeats the trip stack's Home)
// How an incoming request is presented (T-54). Pure: no React, no navigation, no timers.
// 'fullscreen' on the drawer's home (MainHome), 'card' (bottom card) on any other drawer screen, 'none' otherwise.
// While the full-screen request is open (even hidden behind another tab) the card never shows.

export const PRESENTATION = {
  FULLSCREEN: 'fullscreen',
  CARD: 'card',
  NONE: 'none',
};

import { REQUEST_DECISION_WINDOW_MS } from '../../config/passengerApi';

const APPROVED = 'approved';
// Name of the drawer screen that holds the trip stack. The stack has its own 'Home' screen: the names
// must differ so React Navigation does not warn about nested screens with the same name.
export const HOME_ROUTE = 'MainHome';
const TRIP_ROUTE_PREFIX = 'Trip';

// currentRoute: name of the focused drawer screen (null/undefined when unknown).
// requestScreenOpen: true while the TripRequest screen is open.
export function decideRequestPresentation(currentRoute, onTrip, accountStatus, hasRequest, requestScreenOpen = false) {
  if (!hasRequest || onTrip || accountStatus !== APPROVED || requestScreenOpen) return PRESENTATION.NONE;
  if (typeof currentRoute !== 'string' || currentRoute === '') return PRESENTATION.NONE;
  if (currentRoute.startsWith(TRIP_ROUTE_PREFIX)) return PRESENTATION.NONE;
  return currentRoute === HOME_ROUTE ? PRESENTATION.FULLSCREEN : PRESENTATION.CARD;
}

export const secondsUntil = (expiresAt, now) => Math.max(0, Math.ceil((expiresAt - now) / 1000));

// Total length of the decision window (D-137), the same for the card and the full screen so both
// bars match: the fixed window, or the request validity when that is shorter.
export function requestTotalSeconds(request) {
  if (!request) return 1;
  const span = Number.isFinite(request.createdAt) ? request.expiresAt - request.createdAt : NaN;
  const total = Number.isFinite(span) ? Math.min(span, REQUEST_DECISION_WINDOW_MS) : REQUEST_DECISION_WINDOW_MS;
  return Math.max(1, Math.round(total / 1000));
}
