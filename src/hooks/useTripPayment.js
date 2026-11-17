// AI-assisted: see AI_LOG.md #55
// Live saved trip for "Cobro y resumen" (T-96, RF-44): onSnapshot on drivers/{uid}/trips/{tripId}.
// Returns { trip, loading, error } where error is 'offline' | 'failed' | null. Without a tripId (the
// trip is not saved yet) nothing is subscribed. The subscription is released on unmount and when the
// trip or driver changes.

import { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { subscribeTrip } from '../services/tripRepository';
import { IDLE_STATE, startTripPayment } from '../services/trip/tripPaymentSubscription';

export function useTripPayment(tripId) {
  const { driverId } = useAppState();
  const [state, setState] = useState(IDLE_STATE);

  useEffect(
    () => startTripPayment({ subscribe: subscribeTrip, uid: driverId, tripId, onState: setState }),
    [driverId, tripId],
  );

  return state;
}
