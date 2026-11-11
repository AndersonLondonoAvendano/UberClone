// AI-assisted: see docs/AI_LOG.md #43
// The trip in progress (T-44, T-45): one tripController at a time, shared by the request card, the
// trip screen and the summary. It goes through the passenger API port only (never an adapter).
// Starting a trip pauses the availability watch and the request subscription (setOnTrip(true));
// ending it (endTrip, from the summary or after a cancel) disposes the controller and resumes the
// availability the driver had before. Switching availability off during a trip does not stop it.
//
// AI-assisted: see docs/AI_LOG.md #44
// endTrip releases the trip completely and is idempotent: a trip that did not finish is abandoned
// first (its final status is written once), then the controller is disposed (timers, location
// source, queue), the adapter frees the trip (releaseTrip: the mock drops its active trip even if
// completed never arrived), driverLocations gets the idle status, and onTrip turns false. If
// availability was switched off mid-trip, nothing resumes: no new request arrives after this trip.

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as tripConfig from '../config/trip';
import { TRIP_LOCATION_SOURCE, TRIP_SPEED_FACTOR } from '../config/trip';
import { SIMULATED_SPEED_KMH } from '../config/location';
import { DRIVER_LOCATION_IDLE_STATUS } from '../constants/tripStatus';
import { publishDriverLocation, publishDriverTripStatus } from '../services/driverLocationPublisher';
import { createTripLocationSource } from '../services/location';
import { cancelTrip, releaseTrip, reportDriverLocation, reportTripStatus } from '../services/passengerApi';
import { getRoute } from '../services/routing';
import { buildStraightLineRoute } from '../services/routing/straightLine';
import { createTripController } from '../services/trip/tripController';
import { useAvailability } from './AvailabilityContext';

const TripContext = createContext(null);

const api = { reportTripStatus, cancelTrip, reportDriverLocation };

const createLocationSource = ({ coordinates }) =>
  createTripLocationSource(TRIP_LOCATION_SOURCE, {
    coordinates,
    speedKmh: SIMULATED_SPEED_KMH * TRIP_SPEED_FACTOR,
  });

// AI-assisted: see docs/AI_LOG.md #44
// Never awaited and never throws: the UI does not wait for Firestore or the adapter.
const quietly = (call) => {
  Promise.resolve()
    .then(call)
    .catch(() => {});
};

export function TripProvider({ children }) {
  const { getDriverPosition, setOnTrip } = useAvailability();
  const [trip, setTrip] = useState(null); // controller state, or null without a trip
  const controllerRef = useRef(null);

  const disposeController = useCallback(() => {
    if (controllerRef.current) controllerRef.current.dispose();
    controllerRef.current = null;
  }, []);

  useEffect(() => disposeController, [disposeController]);

  // The argument is the Trip returned by acceptRequest.
  const startTrip = useCallback(
    (accepted) => {
      disposeController();
      const position = getDriverPosition();
      const controller = createTripController({
        trip: accepted,
        startPosition: position ?? { ...accepted.request.origin, timestamp: Date.now() },
        api,
        getRoute: (from, to) => getRoute(from, to),
        buildStraightLineRoute: (from, to) => buildStraightLineRoute(from, to),
        createLocationSource,
        publishLocation: publishDriverLocation,
        // AI-assisted: see docs/AI_LOG.md #44 (final status, skips the throttle)
        publishStatus: publishDriverTripStatus,
        config: tripConfig,
        onChange: (state) => {
          if (controllerRef.current === controller) setTrip(state);
        },
      });
      controllerRef.current = controller;
      setTrip(controller.getState());
      setOnTrip(true);
      controller.start();
    },
    [disposeController, getDriverPosition, setOnTrip],
  );

  // AI-assisted: see docs/AI_LOG.md #44
  const endTrip = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (!controller.getState().finished) controller.abandon();
    const final = controller.getState();
    controllerRef.current = null;
    controller.dispose();
    quietly(() => releaseTrip(final.tripId));
    quietly(() => publishDriverTripStatus(DRIVER_LOCATION_IDLE_STATUS, final.position));
    setTrip(null);
    setOnTrip(false);
  }, [setOnTrip]);

  // Each action is a no-op without a trip and always returns a promise.
  const call = useCallback((name) => {
    const controller = controllerRef.current;
    return controller ? Promise.resolve(controller[name]()) : Promise.resolve(false);
  }, []);

  const actions = useMemo(
    () => ({
      startRide: () => call('startRide'),
      finish: () => call('finish'),
      cancel: () => call('cancel'),
      // AI-assisted: see docs/AI_LOG.md #44 (safe exit "Salir del viaje")
      abandon: () => call('abandon'),
      retryRoute: () => call('retryRoute'),
      retryReport: () => call('retryReport'),
      retryLocation: () => call('retryLocation'),
    }),
    [call],
  );

  const value = useMemo(() => ({ trip, startTrip, endTrip, ...actions }), [trip, startTrip, endTrip, actions]);

  return createElement(TripContext.Provider, { value }, children);
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used inside TripProvider');
  return context;
}
