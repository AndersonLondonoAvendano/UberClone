// AI-assisted: see docs/AI_LOG.md #42
// Driver availability (T-42, RF-08). In memory only: no Firestore writes in this slice.
// Turning it on asks the location source's permission (if missing); with permission it starts the
// position (useDriverLocation) and the request subscription (useTripRequests). Turning it off
// stops both. A denied or unavailable permission leaves it off with a notice.

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { getLocationSource } from '../services/location';
import { requestSimulatedTripNow } from '../services/passengerApi';

const AvailabilityContext = createContext(null);

export function AvailabilityProvider({ children }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [notice, setNotice] = useState(null); // null | 'denied' | 'unavailable'
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const location = useDriverLocation({ enabled: isAvailable });

  // The mock reads the latest position through a stable getter, so a new position does not
  // resubscribe.
  const positionRef = useRef(null);
  useEffect(() => {
    positionRef.current = location.position;
  }, [location.position]);
  const getDriverPosition = useCallback(() => positionRef.current, []);

  const { lastRequest, error: requestsError } = useTripRequests({ enabled: isAvailable, getDriverPosition });

  const setAvailable = useCallback(async (next) => {
    if (!next) {
      setIsAvailable(false);
      setNotice(null);
      return;
    }
    setIsChanging(true);
    const permission = await getLocationSource().requestPermission();
    if (!mountedRef.current) return;
    setIsChanging(false);
    if (permission === 'granted') {
      setNotice(null);
      setIsAvailable(true);
    } else {
      setNotice(permission === 'denied' ? 'denied' : 'unavailable');
      setIsAvailable(false);
    }
  }, []);

  const requestSimulatedTrip = useCallback(() => requestSimulatedTripNow(), []);

  const value = useMemo(
    () => ({
      isAvailable,
      isChanging,
      notice,
      setAvailable,
      locationStatus: location.status,
      position: location.position,
      lastRequest,
      requestsError,
      requestSimulatedTrip,
    }),
    [isAvailable, isChanging, notice, setAvailable, location.status, location.position, lastRequest, requestsError, requestSimulatedTrip],
  );

  return createElement(AvailabilityContext.Provider, { value }, children);
}

export function useAvailability() {
  const context = useContext(AvailabilityContext);
  if (!context) throw new Error('useAvailability must be used inside AvailabilityProvider');
  return context;
}
