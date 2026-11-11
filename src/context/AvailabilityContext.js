// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #49 (requestScreenId: id of the request the TripRequest screen holds open)
// Driver availability (T-42, RF-08). In memory only: no Firestore writes for availability.
// Turning it on (a user action) asks the location permission if missing, then checks that the phone
// location is on; if it is off it shows the system dialog ONCE (askToEnableServices). If location is
// still off, availability stays off with the 'services_off' notice and nothing retries by itself.
// It is retried only when the driver touches the switch again, or when the app returns to the
// foreground and the phone location is now on (checked without any dialog).
// While available it keeps the position (useDriverLocation) and the request subscription
// (useTripRequests). During a trip (setOnTrip(true)) both are paused, but isAvailable keeps the
// driver's choice: the trip never depends on availability, and when the trip ends the previous
// availability resumes by itself. Switching it off mid-trip only means "no new requests after this
// trip": the trip goes on, and once it ends onTrip turns false, watching stays false and no
// request arrives (#44).

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { getLocationSource } from '../services/location';
import { requestSimulatedTripNow } from '../services/passengerApi';

const AvailabilityContext = createContext(null);

export function AvailabilityProvider({ children }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [onTrip, setOnTripState] = useState(false);
  const [notice, setNotice] = useState(null); // null | 'denied' | 'unavailable' | 'services_off'
  const [requestScreenId, setRequestScreenId] = useState(null);
  const mountedRef = useRef(true);
  // A user action (permission or the location dialog) is in progress.
  const changingRef = useRef(false);
  // Availability was blocked because the phone location was off; the next foreground return may
  // retry once (without a dialog).
  const blockedRef = useRef(false);
  const isAvailableRef = useRef(false);

  useEffect(() => {
    isAvailableRef.current = isAvailable;
  }, [isAvailable]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const watching = isAvailable && !onTrip;
  const location = useDriverLocation({ enabled: watching });

  // The mock reads the latest position through a stable getter, so a new position does not
  // resubscribe.
  const positionRef = useRef(null);
  useEffect(() => {
    if (location.position) positionRef.current = location.position;
  }, [location.position]);
  const getDriverPosition = useCallback(() => positionRef.current, []);

  const {
    pendingRequest,
    lastRequest,
    error: requestsError,
    clearPendingRequest,
  } = useTripRequests({ enabled: watching, getDriverPosition });

  const blockForServices = useCallback(() => {
    blockedRef.current = true;
    setNotice('services_off');
    setIsAvailable(false);
  }, []);

  // Enables availability: permission (may prompt only on a user action), then the phone location.
  // `allowDialog` is true only for a switch touch; the foreground retry never shows a dialog.
  const enable = useCallback(
    async (allowDialog) => {
      changingRef.current = true;
      setIsChanging(true);
      const source = getLocationSource();
      const finish = () => {
        changingRef.current = false;
        if (mountedRef.current) setIsChanging(false);
      };
      // AI-assisted: see docs/AI_LOG.md #44
      // Only a switch touch may prompt; the foreground check only reads the permission (no dialog).
      const permission = allowDialog ? await source.requestPermission() : await source.getPermission();
      if (!mountedRef.current) return finish();
      if (permission !== 'granted') {
        blockedRef.current = false;
        setNotice(permission === 'denied' ? 'denied' : 'unavailable');
        setIsAvailable(false);
        return finish();
      }
      let servicesOn = await source.checkServices();
      if (!servicesOn && allowDialog) servicesOn = await source.askToEnableServices();
      if (!mountedRef.current) return finish();
      if (!servicesOn) {
        blockForServices();
        return finish();
      }
      blockedRef.current = false;
      setNotice(null);
      setIsAvailable(true);
      return finish();
    },
    [blockForServices],
  );

  const setAvailable = useCallback(
    async (next) => {
      if (changingRef.current) return;
      if (!next) {
        blockedRef.current = false;
        setIsAvailable(false);
        setNotice(null);
        return;
      }
      await enable(true);
    },
    [enable],
  );

  // The phone location was turned off while available: switch off, no automatic restart.
  useEffect(() => {
    if (location.status === 'services_off') blockForServices();
  }, [location.status, blockForServices]);

  // Back in the foreground after being blocked: one silent check; enable only if location is on.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (next) => {
      if (next !== 'active' || !blockedRef.current || changingRef.current || isAvailableRef.current) return;
      const servicesOn = await getLocationSource().checkServices();
      if (!mountedRef.current || !servicesOn || !blockedRef.current || changingRef.current) return;
      enable(false);
    });
    return () => subscription.remove();
  }, [enable]);

  const setOnTrip = useCallback((value) => setOnTripState(Boolean(value)), []);

  const requestSimulatedTrip = useCallback(() => requestSimulatedTripNow(), []);

  const value = useMemo(
    () => ({
      isAvailable,
      isChanging,
      notice,
      setAvailable,
      onTrip,
      setOnTrip,
      locationStatus: location.status,
      position: location.position,
      getDriverPosition,
      pendingRequest,
      clearPendingRequest,
      requestScreenId,
      setRequestScreenId,
      lastRequest,
      requestsError,
      requestSimulatedTrip,
    }),
    [
      isAvailable,
      isChanging,
      notice,
      setAvailable,
      onTrip,
      setOnTrip,
      location.status,
      location.position,
      getDriverPosition,
      pendingRequest,
      clearPendingRequest,
      requestScreenId,
      lastRequest,
      requestsError,
      requestSimulatedTrip,
    ],
  );

  return createElement(AvailabilityContext.Provider, { value }, children);
}

export function useAvailability() {
  const context = useContext(AvailabilityContext);
  if (!context) throw new Error('useAvailability must be used inside AvailabilityProvider');
  return context;
}
