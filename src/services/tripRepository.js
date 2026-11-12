// AI-assisted: see docs/AI_LOG.md #50
// Saved trips: drivers/{uid}/trips/{tripId} (T-46 to T-48). The trip id is the document id, so saving
// the same trip twice never creates a second document. The rules do not allow general updates (only the
// cash confirmation below), so the save reads first: an existing document means "already saved" and nothing is written again.
// No coordinates are stored (see buildTripRecord). Offline, a Firestore write waits forever for the
// network; every save is raced against a clock so the UI never hangs.

import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PAYMENT_STATUS, TRIP_STATUS } from '../constants/tripStatus';
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

// AI-assisted: see docs/AI_LOG.md #55
// Cash only (T-95): the rules allow the driver exactly one update on a saved trip, changing
// paymentStatus and status to paid and nothing else. Card payments are written by the backend.
export async function confirmCashPayment(uid, tripId, { timeoutMs = SAVE_TIMEOUT_MS } = {}) {
  const ref = doc(db, 'drivers', uid, 'trips', tripId);
  await withTimeout(updateDoc(ref, { paymentStatus: PAYMENT_STATUS.PAID, status: TRIP_STATUS.PAID }), timeoutMs);
}

// AI-assisted: see docs/AI_LOG.md #55
// Listens to one saved trip document (T-96). onNext receives { id, ...fields } or null when the document
// does not exist yet; onError receives the Firestore error. Returns the unsubscribe.
export function subscribeTrip(uid, tripId, onNext, onError) {
  return onSnapshot(
    doc(db, 'drivers', uid, 'trips', tripId),
    (snapshot) => onNext(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    (error) => onError(error),
  );
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
