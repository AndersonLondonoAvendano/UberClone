// AI-assisted: see AI_LOG.md #42
// Location entry point (T-41). Hooks import only from here. LOCATION_SOURCE (a constant in
// src/config/location.js) picks the source; both share the interface of gpsLocationSource.js.

import { LOCATION_SOURCE } from '../../config/location';
import { createGpsLocationSource } from './gpsLocationSource';
import { createSimulatedLocationSource } from './simulatedLocationSource';

const source = LOCATION_SOURCE === 'simulated' ? createSimulatedLocationSource() : createGpsLocationSource();

export const getLocationSource = () => source;

export { shouldEmitPosition } from './throttle';

// AI-assisted: see AI_LOG.md #43
// Movement source for one trip leg (T-44). 'simulated' walks `coordinates` (the leg route) at
// speedKmh; 'gps' returns the phone source and ignores the route.
export function createTripLocationSource(kind, { coordinates, speedKmh, tickMs }) {
  if (kind === 'simulated') return createSimulatedLocationSource({ coordinates, speedKmh, tickMs });
  return createGpsLocationSource();
}
