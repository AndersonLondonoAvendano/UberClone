// AI-assisted: see docs/AI_LOG.md #70
// AI-assisted: see docs/AI_LOG.md #72
// Single source of ride requests while the driver is "Disponible" (spec 007, D-197, DT-5). Joins the
// availability reporter, the notifications registration state and AppState, and returns exactly one of
// 'none' | 'server' | 'mock' (chooseRequestSource). The caller starts the in-app simulator only for 'mock'.
// Push requests from the server keep arriving through the existing reception path, not through here.

import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createAvailabilityReporter } from '../services/notifications/availabilityReporter';
import { chooseRequestSource } from '../services/notifications/requestSource';
import { REGISTRATION_STATUS } from '../services/notifications/registration';
import { notificationsApi, traceAvailability } from '../services/notifications/notificationsService';
import { availabilitySeqStore } from '../services/notifications/seqStore';
import { getRegistrationController } from '../services/notifications/registrationRuntime';

const isReady = (state) => Boolean(state && state.enabled === true && state.status === REGISTRATION_STATUS.REGISTERED);

export function useRequestSource({ available, onTrip }) {
  const reporterRef = useRef(null);
  const [notificationsReady, setNotificationsReady] = useState(false);
  const [backendConfirmed, setBackendConfirmed] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  const effective = available === true && onTrip !== true && notificationsReady;

  // The reporter lives while the provider lives; its timer and in-flight answers die with the cleanup.
  useEffect(() => {
    let alive = true;
    reporterRef.current = createAvailabilityReporter({
      api: notificationsApi,
      now: () => Date.now(),
      seqStore: availabilitySeqStore,
      trace: traceAvailability,
      setTimeout: (callback, ms) => setTimeout(callback, ms),
      clearTimeout: (handle) => clearTimeout(handle),
      onConfirmedChange: (value) => {
        if (alive) setBackendConfirmed(value);
      },
    });
    return () => {
      alive = false;
      reporterRef.current.stop();
      reporterRef.current = null;
    };
  }, []);

  // Registration state: notifications enabled and the device token registered.
  useEffect(() => {
    const controller = getRegistrationController();
    setNotificationsReady(isReady(controller.getState()));
    return controller.subscribe((state) => setNotificationsReady(isReady(state)));
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => setAppActive(next === 'active'));
    return () => subscription.remove();
  }, []);

  // Every input change goes to the reporter: it reports state changes at once and paces the heartbeat.
  useEffect(() => {
    if (reporterRef.current) reporterRef.current.update({ effective, foreground: appActive });
  }, [effective, appActive]);

  return chooseRequestSource({ available, onTrip, notificationsReady, backendConfirmed });
}
