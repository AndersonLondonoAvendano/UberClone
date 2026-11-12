// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #49 (requestScreenId: id of the request the TripRequest screen holds open)
// AI-assisted: see docs/AI_LOG.md #55 (F1b: local tracking while Home is focused; publishing only while available)
// AI-assisted: see docs/AI_LOG.md #54 (reset: session reset puts everything back to the initial state)
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
import { useAppState } from './AppStateContext';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { DRIVER_LOCATION_IDLE_STATUS } from '../constants/tripStatus';
import { locationPolicy } from '../services/locationPolicy';
import { publishDriverLocation } from '../services/driverLocationPublisher';
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
  const { accountStatus } = useAppState();
  const [homeFocused, setHomeFocused] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const mountedRef = useRef(true);
  // A user action (permission or the location dialog) is in progress.
  const changingRef = useRef(false);
  // Availability was blocked because the phone location was off; the next foreground return may
  // retry once (without a dialog).
  const blockedRef = useRef(false);
  const isAvailableRef = useRef(false);
  // Bumped by reset(): an enable() that started before a reset must not turn availability back on.
  const resetGenerationRef = useRef(0);

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
  const policy = locationPolicy({
    available: isAvailable,
    accountApproved: accountStatus === ACCOUNT_STATUS.APPROVED,
    permissionGranted,
    focused: homeFocused,
  });
  const location = useDriverLocation({ enabled: policy.track && !onTrip });

  // Reads the permission without any dialog whenever Home is focused (and on foreground return).
  const [foregroundTick, setForegroundTick] = useState(0);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') setForegroundTick((n) => n + 1);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!homeFocused) return undefined;
    let cancelled = false;
    getLocationSource()
      .getPermission()
      .then((permission) => {
        if (!cancelled && mountedRef.current) setPermissionGranted(permission === 'granted');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [homeFocused, isAvailable, foregroundTick]);

  // Publishes to driverLocations only while Disponible (never while merely viewing the map).
  const publishPosition = policy.publish && !onTrip ? location.position : null;
  useEffect(() => {
    if (publishPosition) publishDriverLocation(publishPosition, DRIVER_LOCATION_IDLE_STATUS);
  }, [publishPosition]);

  // Grant button: asks the permission (user action) without turning availability on.
  const requestLocationPermission = useCallback(async () => {
    const permission = await getLocationSource().requestPermission();
    if (mountedRef.current) setPermissionGranted(permission === 'granted');
    return permission;
  }, []);

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
      const generation = resetGenerationRef.current;
      const isStale = () => generation !== resetGenerationRef.current;
      const source = getLocationSource();
      const finish = () => {
        changingRef.current = false;
        if (mountedRef.current) setIsChanging(false);
      };
      // AI-assisted: see docs/AI_LOG.md #44
      // Only a switch touch may prompt; the foreground check only reads the permission (no dialog).
      const permission = allowDialog ? await source.requestPermission() : await source.getPermission();
      if (isStale()) return undefined;
      if (!mountedRef.current) return finish();
      if (permission !== 'granted') {
        blockedRef.current = false;
        setNotice(permission === 'denied' ? 'denied' : 'unavailable');
        setIsAvailable(false);
        return finish();
      }
      let servicesOn = await source.checkServices();
      if (!servicesOn && allowDialog) servicesOn = await source.askToEnableServices();
      if (isStale()) return undefined;
      if (!mountedRef.current) return finish();
      if (!servicesOn) {
        blockForServices();
        return finish();
      }
      blockedRef.current = false;
      setNotice(null);
      setPermissionGranted(true);
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
    // Only while Disponible: local tracking on Home must never mark a block nor re-enable by itself.
    if (location.status === 'services_off' && isAvailableRef.current) blockForServices();
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

  // AI-assisted: see docs/AI_LOG.md #54
  // Session reset: availability off (the effects above then stop the location source and the request
  // subscription), pending request freed, trip flag and notices cleared. Idempotent.
  const reset = useCallback(() => {
    resetGenerationRef.current += 1;
    blockedRef.current = false;
    changingRef.current = false;
    positionRef.current = null;
    setIsAvailable(false);
    setHomeFocused(false);
    setPermissionGranted(false);
    setIsChanging(false);
    setOnTripState(false);
    setNotice(null);
    setRequestScreenId(null);
    clearPendingRequest();
  }, [clearPendingRequest]);

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
      homeFocused,
      setHomeFocused,
      permissionGranted,
      requestLocationPermission,
      reset,
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
      homeFocused,
      permissionGranted,
      requestLocationPermission,
      reset,
    ],
  );

  return createElement(AvailabilityContext.Provider, { value }, children);
}

export function useAvailability() {
  const context = useContext(AvailabilityContext);
  if (!context) throw new Error('useAvailability must be used inside AvailabilityProvider');
  return context;
}

// AI-assisted: see docs/AI_LOG.md #54
// Tolerant read for code that may run outside the provider (useSessionReset): null when absent.
export function useOptionalAvailability() {
  return useContext(AvailabilityContext);
}
