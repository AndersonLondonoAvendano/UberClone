// AI-assisted: see docs/AI_LOG.md #56
// Pure helpers of the paginated history (T-102): merge pages without duplicates and filter by
// payment method on the client (the query itself only ranges over createdAt).

export const HISTORY_METHOD = { ALL: 'all', CARD: 'mercadopago', CASH: 'cash' };

// Appends `incoming` to `current`; a trip whose id is already present is skipped (first one wins).
// Trips without an id are kept as they come.
export function mergeTrips(current, incoming) {
  const base = Array.isArray(current) ? current : [];
  const seen = new Set(base.filter((trip) => trip?.id != null).map((trip) => trip.id));
  const merged = [...base];
  for (const trip of Array.isArray(incoming) ? incoming : []) {
    if (!trip || typeof trip !== 'object') continue;
    if (trip.id != null) {
      if (seen.has(trip.id)) continue;
      seen.add(trip.id);
    }
    merged.push(trip);
  }
  return merged;
}

// 'all' (or an unknown value) keeps every trip; 'mercadopago' and 'cash' match paymentMethod.
export function filterByMethod(trips, method) {
  const list = Array.isArray(trips) ? trips : [];
  if (method !== HISTORY_METHOD.CARD && method !== HISTORY_METHOD.CASH) return list;
  return list.filter((trip) => trip?.paymentMethod === method);
}

// The list the screen shows: loaded pages merged and filtered. "Load more" depends only on whether
// the server may have more pages, never on how many items the filter left.
export function visibleTrips(loadedTrips, method) {
  return filterByMethod(loadedTrips, method);
}

export function canLoadMore({ hasMore, status, loadingMore }) {
  return Boolean(hasMore) && status === 'ready' && !loadingMore;
}

// True when a response belongs to the request that is still current (late responses are dropped).
export const isCurrentRequest = (responseId, currentId) => responseId === currentId;
