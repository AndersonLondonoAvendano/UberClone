// AI-assisted: see docs/AI_LOG.md #43
// Trip in progress (T-44): one controller per accepted trip. Pure JavaScript with every dependency
// injected (passenger API, routing, location source, timers, clock), so it is tested without React.
//
// Legs: driver -> pickup (status driver_arriving), then pickup -> destination (in_progress).
// Per leg: OSRM route with at most ROUTE_MAX_ATTEMPTS attempts; then a straight line marked as
// approximate. retryRoute() asks OSRM again from the current position (one more bounded round).
// The driver position comes from the leg's location source; on each position it updates the
// remaining distance and time, detects the arrival by distance threshold and reports the position
// (throttled). Status changes go through a FIFO queue so the passenger API always receives them in
// order; a report that keeps failing pauses the queue with `reportError` until retryReport().
// Nothing retries forever and nothing restarts by itself after a location error.
//
// AI-assisted: see docs/AI_LOG.md #44
// finish() never hangs: every report attempt has its own timeout (REPORT_ATTEMPT_TIMEOUT_MS) and the
// whole finish waits at most FINISH_TIMEOUT_MS; then finishError (a FINISH_ERROR code: network,
// timeout or rejected) lets the screen offer "Reintentar" and the safe exit "Salir del viaje" (abandon()).
// Every way out (completed, cancelled, abandoned) writes the final status once through
// publishStatus, which skips the position throttle and is never awaited.

import { FINISH_ERROR, TRIP_STATUS } from '../../constants/tripStatus';
import { PASSENGER_API_ERROR } from '../passengerApi';
import { canTransition } from './tripMachine';
import { hasArrived, remainingOnRoute, remainingPath, shouldReportLocation } from './routeProgress';

export const TRIP_PHASE = {
  STARTING: 'starting',
  TO_PICKUP: 'toPickup',
  AT_PICKUP: 'atPickup',
  TO_DESTINATION: 'toDestination',
  AT_DESTINATION: 'atDestination',
  FINISHED: 'finished',
};

const toLngLat = (point) => [point.lng, point.lat];

export function createTripController({
  trip,
  startPosition,
  api, // { reportTripStatus, cancelTrip, reportDriverLocation }
  getRoute, // (from, to) => Promise<route>, rejects on failure (no fallback)
  buildStraightLineRoute, // (from, to) => route
  createLocationSource, // ({ coordinates, start }) => { start({ onPosition, onError, onEnd }) => stop }
  publishLocation = () => Promise.resolve(false),
  // AI-assisted: see docs/AI_LOG.md #44
  publishStatus = () => Promise.resolve(false), // (finalStatus, position) => Promise, never awaited
  config,
  now = () => Date.now(),
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
  onChange = () => {},
}) {
  const request = trip.request;
  const timers = new Map(); // id -> release, so dispose() also releases pending waits
  let disposed = false;
  let stopSource = null;
  let routeRound = 0; // invalidates an older route request when a newer one starts
  let lastReported = null;
  const queue = [];
  let sending = false;
  let finishResolvers = [];
  // AI-assisted: see docs/AI_LOG.md #44
  let completedResult = null; // null | 'delivered' | 'fatal' (what the API said about completed)
  let finishPromise = null;
  let finalPublished = false;
  let cancelling = false;

  let state = {
    tripId: trip.id,
    request,
    acceptedAt: trip.acceptedAt ?? now(),
    status: trip.status ?? TRIP_STATUS.ACCEPTED,
    phase: TRIP_PHASE.STARTING,
    route: null,
    routeLoading: false,
    routeApproximate: false,
    target: null,
    position: startPosition ?? null,
    remainingM: null,
    remainingS: null,
    reportError: false,
    locationError: false,
    cancelError: false,
    finished: null, // null | completed | cancelled (TRIP_STATUS values)
    finishedAt: null,
    // AI-assisted: see docs/AI_LOG.md #50
    startedAt: null, // when the passenger boarded (saved with the trip)
    // AI-assisted: see docs/AI_LOG.md #44
    finishing: false,
    finishError: null, // null | one of FINISH_ERROR
    abandoned: false, // the driver left with "Salir del viaje" without the API confirming
  };

  const set = (patch) => {
    if (disposed) return;
    state = { ...state, ...patch };
    onChange(state);
  };

  const later = (fn, ms) =>
    new Promise((resolve) => {
      const id = setTimer(() => {
        timers.delete(id);
        if (!disposed) fn();
        resolve();
      }, ms);
      timers.set(id, resolve);
    });

  // AI-assisted: see docs/AI_LOG.md #44
  // A plain timer that dispose() clears too.
  const startTimer = (fn, ms) => {
    const id = setTimer(() => {
      timers.delete(id);
      if (!disposed) fn();
    }, ms);
    timers.set(id, () => {});
    return id;
  };

  const cancelTimer = (id) => {
    if (!timers.has(id)) return;
    timers.delete(id);
    clearTimer(id);
  };

  const timeoutError = () => {
    const error = new Error('timeout');
    error.code = 'TIMEOUT';
    return error;
  };

  // Rejects with code TIMEOUT if the call does not settle in time (offline calls may never settle).
  const withTimeout = (call, ms) =>
    new Promise((resolve, reject) => {
      let settled = false;
      const giveUp = () => {
        if (settled) return;
        settled = true;
        reject(timeoutError());
      };
      const id = setTimer(() => {
        timers.delete(id);
        giveUp();
      }, ms);
      timers.set(id, giveUp);
      Promise.resolve()
        .then(call)
        .then(
          (value) => {
            if (settled) return;
            settled = true;
            cancelTimer(id);
            resolve(value);
          },
          (error) => {
            if (settled) return;
            settled = true;
            cancelTimer(id);
            reject(error);
          },
        );
    });

  let movementRound = 0; // invalidates callbacks of a stopped location source

  const stopMovement = () => {
    movementRound += 1;
    const stop = stopSource;
    stopSource = null;
    if (typeof stop === 'function') stop();
  };

  // AI-assisted: see docs/AI_LOG.md #44
  // The final status reaches driverLocations once per trip, whatever the way out.
  const publishFinal = (finalStatus) => {
    if (finalPublished) return;
    finalPublished = true;
    const position = state.position;
    Promise.resolve()
      .then(() => publishStatus(finalStatus, position))
      .catch(() => {});
  };

  // The API confirmed completed: the trip is over (idempotent).
  const complete = () => {
    if (state.finished) return;
    stopMovement();
    set({
      phase: TRIP_PHASE.FINISHED,
      finished: TRIP_STATUS.COMPLETED,
      finishedAt: now(),
      finishing: false,
      finishError: null,
      reportError: false,
    });
    publishFinal(TRIP_STATUS.COMPLETED);
  };

  // ---- Status reports (ordered, bounded retries) ----

  // AI-assisted: see docs/AI_LOG.md #44
  const settleFinish = (ok, error = null) => {
    const resolvers = finishResolvers;
    finishResolvers = [];
    resolvers.forEach((settle) => settle(ok, error));
  };

  // AI-assisted: see docs/AI_LOG.md #44
  // A COMPLETED answer that arrives after its attempt timed out still counts: the API did accept
  // it, so the trip closes and a later INVALID_STATE ("already completed") is not read as a rejection.
  const trackLateCompleted = (call) => {
    call.then(
      () => {
        if (disposed || state.finished || completedResult === 'delivered') return;
        completedResult = 'delivered';
        queue.length = 0;
        complete();
        settleFinish(true);
      },
      () => {},
    );
  };

  async function pump() {
    if (sending || disposed) return;
    sending = true;
    while (queue.length > 0 && !disposed && !state.finished) {
      const status = queue[0];
      let delivered = false;
      let fatal = false;
      for (let attempt = 1; attempt <= config.REPORT_MAX_ATTEMPTS && !disposed && queue[0] === status; attempt += 1) {
        // AI-assisted: see docs/AI_LOG.md #45 (stop retrying once the queue head changed)
        try {
          // AI-assisted: see docs/AI_LOG.md #44 (per-attempt timeout)
          await withTimeout(() => {
            const call = Promise.resolve().then(() => api.reportTripStatus(state.tripId, status));
            if (status === TRIP_STATUS.COMPLETED) trackLateCompleted(call);
            return call;
          }, config.REPORT_ATTEMPT_TIMEOUT_MS);
          delivered = true;
          break;
        } catch (error) {
          // A state the trip does not allow is not a network problem: retrying will not help.
          if (error && error.code === PASSENGER_API_ERROR.INVALID_STATE) {
            fatal = true;
            break;
          }
          if (attempt < config.REPORT_MAX_ATTEMPTS) await later(() => {}, config.REPORT_RETRY_DELAY_MS);
        }
      }
      if (disposed) break;
      // AI-assisted: see docs/AI_LOG.md #44
      // Cancelled or abandoned while this report was in flight: the queue was emptied.
      if (queue[0] !== status) continue;
      if (delivered || fatal) {
        queue.shift();
        if (status === TRIP_STATUS.COMPLETED) {
          completedResult = delivered ? 'delivered' : 'fatal';
          if (delivered) complete();
          settleFinish(delivered, delivered ? null : FINISH_ERROR.REJECTED);
        }
        continue;
      }
      set({ reportError: true });
      settleFinish(false, FINISH_ERROR.NETWORK);
      break;
    }
    sending = false;
    if (!disposed && queue.length === 0 && state.reportError) set({ reportError: false });
  }

  function changeStatus(next) {
    if (!canTransition(state.status, next)) return false;
    set({ status: next });
    queue.push(next);
    pump();
    return true;
  }

  // ---- Position, progress and arrival ----

  function reportPosition(position) {
    if (!shouldReportLocation(lastReported, position, {
      minIntervalMs: config.REPORT_MIN_INTERVAL_MS,
      minDistanceM: config.REPORT_MIN_DISTANCE_M,
    })) return false;
    lastReported = position;
    Promise.resolve()
      .then(() => api.reportDriverLocation(state.tripId, position))
      .catch(() => {});
    Promise.resolve()
      .then(() => publishLocation(position, state.status))
      .catch(() => {});
    return true;
  }

  function arrive() {
    stopMovement();
    if (state.phase === TRIP_PHASE.TO_PICKUP) {
      set({ phase: TRIP_PHASE.AT_PICKUP, remainingM: 0, remainingS: 0 });
      changeStatus(TRIP_STATUS.DRIVER_ARRIVED);
    } else if (state.phase === TRIP_PHASE.TO_DESTINATION) {
      set({ phase: TRIP_PHASE.AT_DESTINATION, remainingM: 0, remainingS: 0 });
    }
  }

  function handlePosition(position) {
    if (disposed || !position) return;
    const moving = state.phase === TRIP_PHASE.TO_PICKUP || state.phase === TRIP_PHASE.TO_DESTINATION;
    const patch = { position, locationError: false };
    if (moving && state.route) {
      const { remainingM, remainingS } = remainingOnRoute(state.route, position);
      patch.remainingM = remainingM;
      patch.remainingS = remainingS;
    }
    set(patch);
    reportPosition(position);
    if (!moving) return;
    const nearTarget = hasArrived(position, state.target, config.ARRIVAL_THRESHOLD_M);
    const nearRouteEnd = patch.remainingM !== undefined && patch.remainingM <= config.ARRIVAL_THRESHOLD_M;
    if (nearTarget || nearRouteEnd) arrive();
  }

  function startMovement() {
    stopMovement();
    if (!state.route) return;
    const coordinates = state.position
      ? remainingPath(state.route.coordinates, state.position)
      : state.route.coordinates;
    // The source may emit synchronously inside start(); `active` drops callbacks from a source that
    // was already stopped (arrival, cancel, new leg) and stops it once start() returns.
    movementRound += 1;
    const round = movementRound;
    const active = () => !disposed && round === movementRound;
    const source = createLocationSource({ coordinates });
    const stop = source.start({
      onPosition: (position) => {
        if (active()) handlePosition(position);
      },
      onError: () => {
        if (!active()) return;
        stopMovement();
        set({ locationError: true });
      },
      // The simulated walk reached the end of the polyline: that is the target.
      onEnd: () => {
        if (!active()) return;
        if (state.phase === TRIP_PHASE.TO_PICKUP || state.phase === TRIP_PHASE.TO_DESTINATION) arrive();
      },
    });
    if (active()) stopSource = stop;
    else if (typeof stop === 'function') stop();
  }

  // ---- Routes ----

  async function loadRoute(target) {
    routeRound += 1;
    const round = routeRound;
    const from = state.position ? toLngLat(state.position) : toLngLat(target);
    const to = toLngLat(target);
    set({ routeLoading: true });
    let route = null;
    for (let attempt = 1; attempt <= config.ROUTE_MAX_ATTEMPTS && !disposed && round === routeRound; attempt += 1) {
      try {
        route = await getRoute(from, to);
        break;
      } catch {
        if (attempt < config.ROUTE_MAX_ATTEMPTS) await later(() => {}, config.ROUTE_RETRY_DELAY_MS);
      }
    }
    if (disposed || round !== routeRound) return null;
    const approximate = !route;
    const finalRoute = route ?? buildStraightLineRoute(from, to);
    const patch = { route: finalRoute, routeLoading: false, routeApproximate: approximate };
    if (state.position) {
      const { remainingM, remainingS } = remainingOnRoute(finalRoute, state.position);
      patch.remainingM = remainingM;
      patch.remainingS = remainingS;
    } else {
      patch.remainingM = finalRoute.distanceM;
      patch.remainingS = finalRoute.durationS;
    }
    set(patch);
    return finalRoute;
  }

  async function beginLeg(phase, target) {
    stopMovement();
    set({ phase, target, route: null, remainingM: null, remainingS: null, routeApproximate: false });
    if (state.position && hasArrived(state.position, target, config.ARRIVAL_THRESHOLD_M)) {
      arrive();
      return;
    }
    const route = await loadRoute(target);
    if (route && state.phase === phase) startMovement();
  }

  // ---- Public actions ----

  return {
    getState: () => state,

    start() {
      changeStatus(TRIP_STATUS.DRIVER_ARRIVING);
      return beginLeg(TRIP_PHASE.TO_PICKUP, request.origin);
    },

    startRide() {
      if (state.phase !== TRIP_PHASE.AT_PICKUP) return Promise.resolve(false);
      if (!changeStatus(TRIP_STATUS.IN_PROGRESS)) return Promise.resolve(false);
      set({ startedAt: now() });
      return beginLeg(TRIP_PHASE.TO_DESTINATION, request.destination).then(() => true);
    },

    // AI-assisted: see docs/AI_LOG.md #44
    // Resolves true once the passenger API received completed (the summary opens then), or false
    // with finishError set, never later than FINISH_TIMEOUT_MS. Calling it again is "Reintentar".
    finish() {
      if (finishPromise) return finishPromise;
      if (state.finished === TRIP_STATUS.COMPLETED) return Promise.resolve(true);
      if (state.finished || state.phase !== TRIP_PHASE.AT_DESTINATION) return Promise.resolve(false);
      if (completedResult === 'delivered') {
        complete();
        return Promise.resolve(true);
      }
      if (completedResult === 'fatal') {
        set({ finishing: false, finishError: FINISH_ERROR.REJECTED });
        return Promise.resolve(false);
      }
      set({ finishing: true, finishError: null, reportError: false });
      const pending = new Promise((resolve) => {
        let settled = false;
        let timerId = null;
        const settle = (ok, error) => {
          if (settled) return;
          settled = true;
          finishResolvers = finishResolvers.filter((other) => other !== settle);
          if (timerId !== null) cancelTimer(timerId);
          finishPromise = null;
          if (!disposed && !ok && !state.finished) {
            set({ finishing: false, finishError: error ?? FINISH_ERROR.NETWORK });
          } else if (!disposed && state.finishing) {
            set({ finishing: false });
          }
          resolve(Boolean(ok) && state.finished === TRIP_STATUS.COMPLETED);
        };
        finishResolvers.push(settle);
        timerId = startTimer(() => settle(false, FINISH_ERROR.TIMEOUT), config.FINISH_TIMEOUT_MS);
      });
      finishPromise = pending;
      if (state.status !== TRIP_STATUS.COMPLETED) changeStatus(TRIP_STATUS.COMPLETED);
      else pump();
      return pending;
    },

    // AI-assisted: see docs/AI_LOG.md #44 (timeout, single flight, final status published)
    async cancel() {
      if (state.finished || cancelling || disposed) return false;
      if (completedResult === 'delivered') {
        complete();
        return false;
      }
      cancelling = true;
      set({ cancelError: false });
      try {
        try {
          await withTimeout(() => api.cancelTrip(state.tripId), config.REPORT_ATTEMPT_TIMEOUT_MS);
        } catch (error) {
          if (!(error && error.code === PASSENGER_API_ERROR.INVALID_STATE)) {
            set({ cancelError: true });
            return false;
          }
        }
        if (disposed || state.finished) return false;
        stopMovement();
        routeRound += 1;
        queue.length = 0;
        settleFinish(false, FINISH_ERROR.CANCELLED);
        set({
          status: TRIP_STATUS.CANCELLED,
          phase: TRIP_PHASE.FINISHED,
          finished: TRIP_STATUS.CANCELLED,
          finishedAt: now(),
          finishing: false,
          finishError: null,
          reportError: false,
          cancelError: false,
          routeLoading: false,
        });
        publishFinal(TRIP_STATUS.CANCELLED);
        return true;
      } finally {
        cancelling = false;
      }
    },

    // AI-assisted: see docs/AI_LOG.md #44
    // Safe exit "Salir del viaje": ends the trip locally when the API cannot confirm it (no network,
    // timeout, rejected). At the destination it counts as completed, otherwise as cancelled. It
    // stops everything, writes that final status once and returns it. Idempotent.
    abandon() {
      if (state.finished) return state.finished;
      const final =
        state.phase === TRIP_PHASE.AT_DESTINATION || completedResult === 'delivered'
          ? TRIP_STATUS.COMPLETED
          : TRIP_STATUS.CANCELLED;
      stopMovement();
      routeRound += 1;
      queue.length = 0;
      settleFinish(false, 'abandoned');
      set({
        status: final,
        phase: TRIP_PHASE.FINISHED,
        finished: final,
        finishedAt: now(),
        abandoned: true,
        finishing: false,
        finishError: null,
        reportError: false,
        cancelError: false,
        routeLoading: false,
      });
      publishFinal(final);
      return final;
    },

    // Asks OSRM again for the current leg (only meaningful while the route is approximate).
    async retryRoute() {
      if (state.routeLoading || !state.target) return;
      const moving = state.phase === TRIP_PHASE.TO_PICKUP || state.phase === TRIP_PHASE.TO_DESTINATION;
      if (!moving) return;
      const phase = state.phase;
      stopMovement();
      const route = await loadRoute(state.target);
      if (route && state.phase === phase) startMovement();
    },

    retryReport() {
      if (state.reportError) set({ reportError: false });
      pump();
    },

    retryLocation() {
      if (!state.locationError) return;
      set({ locationError: false });
      startMovement();
    },

    dispose() {
      disposed = true;
      stopMovement();
      timers.forEach((release, id) => {
        clearTimer(id);
        release();
      });
      timers.clear();
      queue.length = 0;
      settleFinish(false);
    },
  };
}
