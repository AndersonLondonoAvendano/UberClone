// AI-assisted: see docs/AI_LOG.md #72
// T-285 (D-200): the arrival at the pickup is automatic only. There is no manual "arrive" action; the
// distance threshold and the end of the route share one guard: one driver_arrived transition, one report.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { makeController, settle } = await import('./tripControllerHarness.mjs');
const { TRIP_STATUS } = await import('../../src/constants/tripStatus.js');
const { TRIP_PHASE } = await import('../../src/services/trip/tripController.js');

const arrivedReports = (calls) => calls.reports.filter((s) => s === TRIP_STATUS.DRIVER_ARRIVED).length;

test('the controller no longer exposes a manual arrive', async () => {
  const { controller } = makeController();
  assert.equal(controller.arrive, undefined);
  controller.dispose();
});

test('driver_arriving does not move on its own without arrival', async () => {
  const { controller, calls } = makeController();
  await controller.start();
  await settle();
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVING);
  assert.equal(controller.getState().phase, TRIP_PHASE.TO_PICKUP);
  assert.equal(await controller.startRide(), false, 'no "Pasajero a bordo" before arriving');
  assert.equal(arrivedReports(calls), 0);
  controller.dispose();
});

test('end of the route: one transition, one report, then the ride can start', async () => {
  const { controller, calls, handlers } = makeController();
  await controller.start();
  handlers.onEnd();
  await settle();
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVED);
  assert.equal(controller.getState().phase, TRIP_PHASE.AT_PICKUP);
  assert.equal(arrivedReports(calls), 1);
  assert.equal(await controller.startRide(), true);
  controller.dispose();
});

test('arrival by distance and then a late end callback: still one report', async () => {
  const { controller, calls, handlers } = makeController();
  await controller.start();
  handlers.onPosition({ lat: 4.6, lng: -74.08, timestamp: 1 }); // exactly at the pickup
  handlers.onEnd?.();
  handlers.onPosition({ lat: 4.6, lng: -74.08, timestamp: 2 });
  await settle();
  assert.equal(controller.getState().status, TRIP_STATUS.DRIVER_ARRIVED);
  assert.equal(arrivedReports(calls), 1);
  controller.dispose();
});

test('end of the route twice (and in the destination leg) does not repeat the report', async () => {
  const { controller, calls, handlers } = makeController();
  await controller.start();
  handlers.onEnd();
  handlers.onEnd();
  await settle();
  assert.equal(arrivedReports(calls), 1);
  await controller.startRide();
  await settle();
  assert.equal(arrivedReports(calls), 1);
  controller.dispose();
});
