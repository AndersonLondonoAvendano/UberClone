// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #44
// Optional Firestore document driverLocations/{uid} with the driver position and the trip status,
// written with set + merge. It never blocks the trip and never rejects (it resolves true or false).
// The ordering, the bounded retries, the per-write timeout and the "latest position only" rule live
// in src/services/trip/driverLocationWriter.js. Only the fields allowed by the published rule are
// written: lat, lng, timestamp, tripStatus, updatedAt (server time).

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import * as tripConfig from '../config/trip';
import { PUBLISH_DRIVER_LOCATION } from '../config/trip';
import { auth, db } from './firebase';
import { createDriverLocationWriter } from './trip/driverLocationWriter';

const writer = createDriverLocationWriter({
  enabled: PUBLISH_DRIVER_LOCATION,
  getUid: () => auth.currentUser?.uid ?? null,
  write: (uid, data) => setDoc(doc(db, 'driverLocations', uid), data, { merge: true }),
  makeTimestamp: () => serverTimestamp(),
  config: tripConfig,
});

// A position during the trip (throttled by the trip controller).
export function publishDriverLocation(position, tripStatus) {
  return writer.publishPosition(position, tripStatus);
}

// The final status (completed or cancelled) or DRIVER_LOCATION_IDLE_STATUS once back on Home.
export function publishDriverTripStatus(tripStatus, position) {
  return writer.publishStatus(tripStatus, position);
}
