// AI-assisted: see docs/AI_LOG.md #56
// Paginated history of saved trips (T-102): 20 per page, range on createdAt, payment method filtered
// on the client. status: 'idle' | 'loading' | 'ready' | 'error'. Changing start/end restarts from the
// first page; a late response of a previous filter is dropped. With start/end null (invalid Rango)
// nothing is queried. useTrips stays for Ganancias.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { fetchTripsPage } from '../services/tripRepository';
import { canLoadMore, isCurrentRequest, mergeTrips, visibleTrips } from '../utils/historyQuery';

const EMPTY = { loaded: [], cursor: null, hasMore: false, status: 'idle', loadingMore: false, error: null };

export function useTripHistory({ start, end, method = 'all' }) {
  const { driverId } = useAppState();
  const [state, setState] = useState(EMPTY);
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(0);
  const cursorRef = useRef(null);

  useEffect(() => {
    requestId.current += 1;
    const id = requestId.current;
    cursorRef.current = null;
    if (!driverId || start == null || end == null) {
      setState(EMPTY);
      return undefined;
    }
    setState({ ...EMPTY, status: 'loading' });
    fetchTripsPage(driverId, { start, end })
      .then((page) => {
        if (!isCurrentRequest(id, requestId.current)) return;
        cursorRef.current = page.cursor;
        setState({ ...EMPTY, status: 'ready', loaded: mergeTrips([], page.trips), cursor: page.cursor, hasMore: page.hasMore });
      })
      .catch((error) => {
        if (!isCurrentRequest(id, requestId.current)) return;
        setState({ ...EMPTY, status: 'error', error });
      });
    return () => {
      // Invalidate the request of this filter so its response is ignored.
      requestId.current += 1;
    };
  }, [driverId, start, end, attempt]);

  const loadMore = useCallback(() => {
    if (!driverId || start == null || end == null) return;
    if (!canLoadMore(state)) return;
    const id = requestId.current;
    setState((prev) => ({ ...prev, loadingMore: true, error: null }));
    fetchTripsPage(driverId, { start, end, cursor: cursorRef.current })
      .then((page) => {
        if (!isCurrentRequest(id, requestId.current)) return;
        cursorRef.current = page.cursor ?? cursorRef.current;
        setState((prev) => ({ ...prev, loaded: mergeTrips(prev.loaded, page.trips), cursor: page.cursor, hasMore: page.hasMore, loadingMore: false }));
      })
      .catch((error) => {
        if (!isCurrentRequest(id, requestId.current)) return;
        setState((prev) => ({ ...prev, loadingMore: false, error }));
      });
  }, [driverId, start, end, state]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    trips: visibleTrips(state.loaded, method),
    status: state.status,
    loadingMore: state.loadingMore,
    hasMore: state.hasMore,
    error: state.error,
    loadMore,
    retry,
  };
}
