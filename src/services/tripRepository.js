// AI-assisted: see docs/AI_LOG.md #50
// Saved trips: drivers/{uid}/trips/{tripId} (T-46 to T-48). The trip id is the document id, so saving
// the same trip twice never creates a second document. The rules do not allow general updates (only the
// cash confirmation below), so the save reads first: an existing document means "already saved" and nothing is written again.
// No coordinates are stored (see buildTripRecord). Offline, a Firestore write waits forever for the
// network; every save is raced against a clock so the UI never hangs.

import { Timestamp, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { PAYMENT_STATUS, TRIP_STATUS } from '../constants/tripStatus';
import { withTimeout } from './trip/saveRetry';

export const SAVE_TIMEOUT_MS = 8000;
export const TRIPS_LIMIT = 200;
export const TRIPS_PAGE_SIZE = 20;

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

// AI-assisted: see docs/AI_LOG.md #56
// One page of the history (T-102): createdAt descending, range only on createdAt (a single field, so no
// composite index), pageSize documents, continuing after the cursor (the last document of the previous
// page). The query is built with injected Firestore functions so a test can inspect the arguments.
export function buildTripsPageQuery(fns, tripsCollection, { start, end, pageSize = TRIPS_PAGE_SIZE, cursor = null }) {
  const constraints = [
    fns.orderBy('createdAt', 'desc'),
    fns.where('createdAt', '>=', fns.Timestamp.fromMillis(start)),
    fns.where('createdAt', '<', fns.Timestamp.fromMillis(end)),
    fns.limit(pageSize),
  ];
  if (cursor) constraints.push(fns.startAfter(cursor));
  return fns.query(tripsCollection, ...constraints);
}

// Runs one page with injected functions. hasMore is true when the page came back full.
export async function fetchTripsPageWith(fns, tripsCollection, { start, end, pageSize = TRIPS_PAGE_SIZE, cursor = null }) {
  const snapshot = await fns.getDocs(buildTripsPageQuery(fns, tripsCollection, { start, end, pageSize, cursor }));
  const docs = snapshot.docs;
  return {
    trips: docs.map((item) => ({ id: item.id, ...item.data() })),
    cursor: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === pageSize,
  };
}

const FIRESTORE_FNS = { Timestamp, getDocs, limit, orderBy, query, startAfter, where };

// start and end are epoch ms ([start, end)); returns { trips, cursor, hasMore }.
export function fetchTripsPage(uid, { start, end, pageSize = TRIPS_PAGE_SIZE, cursor = null }) {
  return fetchTripsPageWith(FIRESTORE_FNS, collection(db, 'drivers', uid, 'trips'), { start, end, pageSize, cursor });
}

// AI-assisted: see docs/AI_LOG.md #65
// Every trip finished inside [start, end) for the earnings totals (RC-04). One field only (finishedAt:
// orderBy plus range), so the automatic single-field index serves it and no composite index is needed.
// Reads pages of pageSize with startAfter until a short page or maxDocs (hard cap; truncated = true).
// Reads are bounded by the range; the history pagination above is untouched.
export const TRIPS_RANGE_PAGE_SIZE = 500;
export const TRIPS_RANGE_MAX_DOCS = 5000;

export async function fetchTripsInRangeWith(
  fns,
  tripsCollection,
  { start, end, pageSize = TRIPS_RANGE_PAGE_SIZE, maxDocs = TRIPS_RANGE_MAX_DOCS },
) {
  const trips = [];
  let cursor = null;
  while (trips.length < maxDocs) {
    const size = Math.min(pageSize, maxDocs - trips.length);
    const constraints = [
      fns.orderBy('finishedAt', 'desc'),
      fns.where('finishedAt', '>=', fns.Timestamp.fromMillis(start)),
      fns.where('finishedAt', '<', fns.Timestamp.fromMillis(end)),
      fns.limit(size),
    ];
    if (cursor) constraints.push(fns.startAfter(cursor));
    const { docs } = await fns.getDocs(fns.query(tripsCollection, ...constraints));
    for (const item of docs) trips.push({ id: item.id, ...item.data() });
    if (docs.length < size) return { trips, truncated: false };
    cursor = docs[docs.length - 1];
  }
  return { trips, truncated: true };
}

// AI-assisted: see docs/AI_LOG.md #66
// Every saved trip of the driver for the balance (B1, D-182): createdAt descending, pages of pageSize with
// startAfter, hard cap maxDocs (truncated = true when the cap was reached and there may be more). One
// field only, so no composite index. Cost: one read per trip returned (at most maxDocs per call).
// Returns { trips, truncated }; a Firestore error propagates (the caller must never show 0 on error).
export async function fetchAllTripsWith(fns, tripsCollection, { pageSize = TRIPS_RANGE_PAGE_SIZE, maxDocs = TRIPS_RANGE_MAX_DOCS } = {}) {
  const trips = [];
  let cursor = null;
  while (trips.length < maxDocs) {
    const size = Math.min(pageSize, maxDocs - trips.length);
    const constraints = [fns.orderBy('createdAt', 'desc'), fns.limit(size)];
    if (cursor) constraints.push(fns.startAfter(cursor));
    const { docs } = await fns.getDocs(fns.query(tripsCollection, ...constraints));
    for (const item of docs) trips.push({ id: item.id, ...item.data() });
    if (docs.length < size) return { trips, truncated: false };
    cursor = docs[docs.length - 1];
  }
  // AI-assisted: see docs/AI_LOG.md #66 (C2b: exactly maxDocs trips is not truncated; one extra read tells
  // whether there is anything after the cap)
  const probeConstraints = [fns.orderBy('createdAt', 'desc'), fns.limit(1)];
  if (cursor) probeConstraints.push(fns.startAfter(cursor));
  const { docs: more } = await fns.getDocs(fns.query(tripsCollection, ...probeConstraints));
  return { trips, truncated: more.length > 0 };
}

export function fetchAllTrips(uid, { pageSize = TRIPS_RANGE_PAGE_SIZE, maxDocs = TRIPS_RANGE_MAX_DOCS } = {}) {
  return fetchAllTripsWith(FIRESTORE_FNS, collection(db, 'drivers', uid, 'trips'), { pageSize, maxDocs });
}

// start and end are epoch ms ([start, end)); returns { trips, truncated }.
export function fetchTripsInRange(uid, { start, end, pageSize = TRIPS_RANGE_PAGE_SIZE, maxDocs = TRIPS_RANGE_MAX_DOCS }) {
  return fetchTripsInRangeWith(FIRESTORE_FNS, collection(db, 'drivers', uid, 'trips'), { start, end, pageSize, maxDocs });
}
