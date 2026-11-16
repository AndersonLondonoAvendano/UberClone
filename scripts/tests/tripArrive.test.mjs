// AI-assisted: see docs/AI_LOG.md #66
// T-223 (CA-005-15): arrive() ("Llegué") is idempotent and shares the guard with the automatic detection.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { makeController, settle } = await import('./tripControllerHarness.mjs');
const { TRIP_STATUS } = await import('../../src/constants/tripStatus.js');
const { TRIP_PHASE } = await import('../../src/services/trip/tripController.js');

const arrivedReports = (calls) => calls.reports.filter((s) => s === TRIP_STATUS.DRIVER_ARRIVED).length;

test('manual arrive from driver_arriving: one transition, one report', async () => {
  const { controller, calls } = makeController();
  await controller.start();
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVING);
  assert.equal(controller.arrive(), true);
  await settle();
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVED);
  assert.equal(controller.getState().phase, TRIP_PHASE.AT_PICKUP);
  assert.equal(arrivedReports(calls), 1);
  // Pressed again: nothing.
  assert.equal(controller.arrive(), false);
  await settle();
  assert.equal(arrivedReports(calls), 1);
  // It enables starting the ride.
  assert.equal(await controller.startRide(), true);
  controller.dispose();
});

test('manual arrive then the automatic detection: still one report', async () => {
  const { controller, calls, handlers } = makeController();
  await controller.start();
  controller.arrive();
  // A late callback of the stopped source and a position at the pickup do nothing more.
  handlers.onEnd?.();
  handlers.onPosition?.({ lat: 4.6, lng: -74.08, timestamp: 1 });
  await settle();
  assert.equal(arrivedReports(calls), 1);
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVED);
  controller.dispose();
});

test('automatic detection then manual arrive: still one report', async () => {
  const { controller, calls, handlers } = makeController();
  await controller.start();
  handlers.onEnd();
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVED);
  assert.equal(controller.arrive(), false);
  await settle();
  assert.equal(arrivedReports(calls), 1);
  controller.dispose();
});

test('arrive in the wrong state does nothing', async () => {
  // accepted (before start): not driver_arriving yet.
  const early = makeController();
  assert.equal(early.controller.arrive(), false);
  assert.equal(early.controller.getState().status, TRIP_STATUS.ACCEPTED);
  early.controller.dispose();

  // in_progress.
  const ride = makeController();
  await ride.controller.start();
  ride.controller.arrive();
  await ride.controller.startRide();
  await settle();
  assert.equal(ride.controller.arrive(), false);
  assert.equal(ride.controller.getState().status, TRIP_STATUS.IN_PROGRESS);
  assert.equal(arrivedReports(ride.calls), 1);
  ride.controller.dispose();

  // finished.
  const done = makeController();
  await done.controller.start();
  await done.controller.cancel();
  assert.equal(done.controller.arrive(), false);
  assert.equal(done.controller.getState().status, TRIP_STATUS.CANCELLED);
  done.controller.dispose();
});

test('arrive needs no position and no loaded route', async () => {
  const { controller } = makeController();
  const started = controller.start(); // the route is still loading
  assert.equal(controller.getState().routeLoading, true);
  assert.equal(controller.arrive(), true);
  await started;
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVED);
  assert.equal(controller.getState().phase, TRIP_PHASE.AT_PICKUP);
  controller.dispose();
});
