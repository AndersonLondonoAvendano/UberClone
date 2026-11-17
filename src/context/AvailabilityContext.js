// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #49 (requestScreenId: id of the request the TripRequest screen holds open)
// AI-assisted: see docs/AI_LOG.md #55 (F1b: local tracking while Home is focused; publishing only while available)
// AI-assisted: see docs/AI_LOG.md #54 (reset: session reset puts everything back to the initial state)
// AI-assisted: see docs/AI_LOG.md #72 (D-201: the choice is saved per uid on the phone and restored on open)
// Driver availability (T-42, RF-08). Kept in memory and, per uid, in local storage (availabilityPreference):
// no Firestore writes for availability. Three states (availabilityState): 'restoring' while the saved choice
// is read at open, 'available', 'unavailable'; isAvailable stays a boolean (true only for 'available').
// Restore rule (shouldRestoreAvailability): only if the saved choice is true, the account is approved, there
// is no trip and the location permission and phone location are already on; no dialog, no notice, otherwise
// it opens 'unavailable' in silence.
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
import { AVAILABILITY_STATE } from '../services/notifications/eligibility';
import { availabilityPreference } from '../services/availabilityPreference';
import { shouldRestoreAvailability } from '../services/availabilityRestore';
import { useAppState } from './AppStateContext';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { DRIVER_LOCATION_IDLE_STATUS } from '../constants/tripStatus';
import { locationPolicy } from '../services/locationPolicy';
import { publishDriverLocation } from '../services/driverLocationPublisher';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { useRequestSource } from '../hooks/useRequestSource';
import { REQUEST_SOURCE } from '../services/notifications/requestSource';
import { getLocationSource } from '../services/location';
import { requestSimulatedTripNow } from '../services/passengerApi';

const AvailabilityContext = createContext(null);

export function AvailabilityProvider({ children }) {
  const [isAvailable, setIsAvailableState] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [onTrip, setOnTripState] = useState(false);
  const [notice, setNotice] = useState(null); // null | 'denied' | 'unavailable' | 'services_off'
  const [requestScreenId, setRequestScreenId] = useState(null);
  const { accountStatus, driverId } = useAppState();
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
  // AI-assisted: see docs/AI_LOG.md #64 (D-149): drawer screen the driver was on when a notification tap
  // opened the request; the request screen returns there when it closes. A ref: it never renders.
  const requestOriginRef = useRef(null);
  const setRequestOrigin = useCallback((route) => {
    requestOriginRef.current = typeof route === 'string' && route !== '' ? route : null;
  }, []);
  const takeRequestOrigin = useCallback(() => {
    const origin = requestOriginRef.current;
    requestOriginRef.current = null;
    return origin;
  }, []);

  useEffect(() => {
    isAvailableRef.current = isAvailable;
  }, [isAvailable]);

  // The ref is updated at once (not only in the effect above) so a consumer that reacts in the same commit
  // already sees the new value.
  const setIsAvailable = useCallback((value) => {
    isAvailableRef.current = value;
    setIsAvailableState(value);
  }, []);
  const driverIdRef = useRef(driverId);
  driverIdRef.current = driverId;
  const onTripRef = useRef(false);
  // The uid whose saved choice was already resolved; a toggle or a reset also marks it as resolved.
  const resolvedUidRef = useRef(null);
  const persistAvailability = useCallback((value) => {
    const uid = driverIdRef.current;
    if (uid) availabilityPreference.set(uid, value).catch(() => {});
  }, []);

  // D-201: restore the saved choice once per uid, when the account status is resolved.
  useEffect(() => {
    if (!driverId) {
      resolvedUidRef.current = null;
      setRestoring(false);
      return undefined;
    }
    if (resolvedUidRef.current === driverId) return undefined;
    if (accountStatus === ACCOUNT_STATUS.LOADING) {
      setRestoring(true);
      return undefined;
    }
    resolvedUidRef.current = driverId;
    setRestoring(true);
    // No cancel on dependency changes: the uid is already marked as resolved, so a re-run would never
    // clear 'restoring'. Unmount and reset are guarded below.
    const generation = resetGenerationRef.current;
    shouldRestoreAvailability({
      uid: driverId,
      accountApproved: accountStatus === ACCOUNT_STATUS.APPROVED,
      onTrip: onTripRef.current,
      preference: availabilityPreference,
      locationSource: getLocationSource(),
    })
      .catch(() => false)
      .then((restore) => {
        if (!mountedRef.current || generation !== resetGenerationRef.current) return;
        // A switch touch while restoring wins over the saved value.
        if (restore && !changingRef.current && !isAvailableRef.current) {
          blockedRef.current = false;
          setNotice(null);
          setPermissionGranted(true);
          setIsAvailable(true);
        }
        setRestoring(false);
      });
    return undefined;
  }, [driverId, accountStatus, setIsAvailable]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

  // AI-assisted: see docs/AI_LOG.md #70 (D-197): the in-app simulator runs only when it is the single source;
  // otherwise the backend generator sends the requests as pushes (adopted without a subscription).
  const requestSource = useRequestSource({ available: isAvailable, onTrip });

  const {
    pendingRequest,
    lastRequest,
    error: requestsError,
    clearPendingRequest,
    offerPushRequest: offerPushRequestUnchecked,
    pushOffered,
  } = useTripRequests({ enabled: requestSource === REQUEST_SOURCE.MOCK, getDriverPosition });

  // A2 (D-181), defense in depth: a push request is never offered while the driver is not Disponible.
  // AI-assisted: see docs/AI_LOG.md #66
  const offerPushRequest = useCallback(
    (request, options) => (isAvailableRef.current ? offerPushRequestUnchecked(request, options) : Promise.resolve(false)),
    [offerPushRequestUnchecked],
  );

  const blockForServices = useCallback(() => {
    blockedRef.current = true;
    setNotice('services_off');
    setIsAvailable(false);
  }, [setIsAvailable]);

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
      persistAvailability(true);
      return finish();
    },
    [blockForServices, persistAvailability, setIsAvailable],
  );

  const setAvailable = useCallback(
    async (next) => {
      if (changingRef.current) return;
      resolvedUidRef.current = driverIdRef.current;
      setRestoring(false);
      if (!next) {
        blockedRef.current = false;
        setIsAvailable(false);
        setNotice(null);
        persistAvailability(false);
        return;
      }
      await enable(true);
    },
    [enable, persistAvailability, setIsAvailable],
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

  const setOnTrip = useCallback((value) => {
    onTripRef.current = Boolean(value);
    setOnTripState(Boolean(value));
  }, []);

  const requestSimulatedTrip = useCallback(() => requestSimulatedTripNow(), []);

  // AI-assisted: see docs/AI_LOG.md #54
  // Session reset: availability off (the effects above then stop the location source and the request
  // subscription), pending request freed, trip flag and notices cleared. Idempotent.
  const reset = useCallback(() => {
    resetGenerationRef.current += 1;
    resolvedUidRef.current = driverIdRef.current;
    setRestoring(false);
    onTripRef.current = false;
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
    requestOriginRef.current = null;
    clearPendingRequest();
  }, [clearPendingRequest, setIsAvailable]);

  const availabilityState = restoring
    ? AVAILABILITY_STATE.RESTORING
    : isAvailable
      ? AVAILABILITY_STATE.AVAILABLE
      : AVAILABILITY_STATE.UNAVAILABLE;

  const value = useMemo(
    () => ({
      isAvailable,
      availabilityState,
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
      offerPushRequest,
      pushOffered,
      requestScreenId,
      setRequestScreenId,
      setRequestOrigin,
      takeRequestOrigin,
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
      availabilityState,
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
      offerPushRequest,
      pushOffered,
      requestScreenId,
      setRequestOrigin,
      takeRequestOrigin,
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
