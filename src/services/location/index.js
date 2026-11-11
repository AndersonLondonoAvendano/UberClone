// AI-assisted: see docs/AI_LOG.md #42
// Location entry point (T-41). Hooks import only from here. LOCATION_SOURCE (a constant in
// src/config/location.js) picks the source; both share the interface of gpsLocationSource.js.

import { LOCATION_SOURCE } from '../../config/location';
import { createGpsLocationSource } from './gpsLocationSource';
import { createSimulatedLocationSource } from './simulatedLocationSource';

const source = LOCATION_SOURCE === 'simulated' ? createSimulatedLocationSource() : createGpsLocationSource();

export const getLocationSource = () => source;

export { shouldEmitPosition } from './throttle';
