// AI-assisted: see docs/AI_LOG.md #47
// AI-assisted: see docs/AI_LOG.md #49
// How an incoming request is presented (T-54). Pure: no React, no navigation, no timers.
// 'fullscreen' on Home, 'card' (bottom card) on any other drawer screen, 'none' otherwise.
// While the full-screen request is open (even hidden behind another tab) the card never shows.

export const PRESENTATION = {
  FULLSCREEN: 'fullscreen',
  CARD: 'card',
  NONE: 'none',
};

const APPROVED = 'approved';
const HOME_ROUTE = 'Home';
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

// Total length of the request window, the same for the card and the full screen so both bars match.
export function requestTotalSeconds(request) {
  if (!request) return 1;
  const span = Number.isFinite(request.createdAt) ? request.expiresAt - request.createdAt : NaN;
  return Math.max(1, Math.round((Number.isFinite(span) ? span : 30000) / 1000));
}
