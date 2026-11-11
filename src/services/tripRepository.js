// AI-assisted: see docs/AI_LOG.md #50
// Saved trips: drivers/{uid}/trips/{tripId} (T-46 to T-48). The trip id is the document id, so saving
// the same trip twice never creates a second document. The rules do not allow updates, so the save
// reads first: an existing document means "already saved" and nothing is written again.
// No coordinates are stored (see buildTripRecord). Offline, a Firestore write waits forever for the
// network; every save is raced against a clock so the UI never hangs.

import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { withTimeout } from './trip/saveRetry';

export const SAVE_TIMEOUT_MS = 8000;
export const TRIPS_LIMIT = 200;

export async function saveTrip(uid, tripId, record, { timeoutMs = SAVE_TIMEOUT_MS } = {}) {
  const ref = doc(db, 'drivers', uid, 'trips', tripId);
  const existing = await withTimeout(getDoc(ref), timeoutMs);
  if (existing.exists()) return { alreadySaved: true };
  await withTimeout(setDoc(ref, { ...record, createdAt: serverTimestamp() }), timeoutMs);
  return { alreadySaved: false };
}

// Listens to the driver's most recent trips (finishedAt descending, at most TRIPS_LIMIT).
// onData receives [{ id, ...fields }]; onError receives the Firestore error. Returns the unsubscribe.
export function listenToTrips(uid, { onData, onError, max = TRIPS_LIMIT }) {
  const trips = query(collection(db, 'drivers', uid, 'trips'), orderBy('finishedAt', 'desc'), limit(max));
  return onSnapshot(
    trips,
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    (error) => onError(error),
  );
}
