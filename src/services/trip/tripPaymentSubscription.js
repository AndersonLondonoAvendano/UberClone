// AI-assisted: see docs/AI_LOG.md #55
// Pure core of useTripPayment (T-96): subscribes to one saved trip through an injected `subscribe`
// (tripRepository.subscribeTrip in the app) and reports { trip, loading, error }. Returns the cleanup:
// it unsubscribes and drops any later callback, so nothing updates an unmounted screen.

export const TRIP_PAYMENT_ERROR = {
  OFFLINE: 'offline',
  FAILED: 'failed',
};

// Firestore reports "unavailable" when the client cannot reach the server.
export function classifyTripError(error) {
  return error?.code === 'unavailable' ? TRIP_PAYMENT_ERROR.OFFLINE : TRIP_PAYMENT_ERROR.FAILED;
}

export const IDLE_STATE = { trip: null, loading: false, error: null };
export const LOADING_STATE = { trip: null, loading: true, error: null };

export function startTripPayment({ subscribe, uid, tripId, onState }) {
  if (!uid || !tripId) {
    onState(IDLE_STATE);
    return () => {};
  }
  let active = true;
  let unsubscribe = null;
  onState(LOADING_STATE);
  try {
    unsubscribe = subscribe(
      uid,
      tripId,
      (trip) => {
        if (active) onState({ trip, loading: false, error: null });
      },
      (error) => {
        if (active) onState({ trip: null, loading: false, error: classifyTripError(error) });
      },
    );
  } catch (error) {
    onState({ trip: null, loading: false, error: classifyTripError(error) });
  }
  return () => {
    active = false;
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}
