// AI-assisted: see AI_LOG.md #66
// T-222 (CA-005-08, CA-005-09): cancel() only before in_progress; abandon() keeps its behaviour.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { makeController, settle } = await import('./tripControllerHarness.mjs');
const { TRIP_STATUS } = await import('../../src/constants/tripStatus.js');
const { TRIP_PHASE } = await import('../../src/services/trip/tripController.js');

async function toAtPickup(ctx) {
  await ctx.controller.start();
  ctx.handlers.onEnd(); // automatic arrival: the simulated walk reached the pickup (D-200)
  await settle();
}

test('cancel is allowed from accepted', async () => {
  const { controller, calls } = makeController();
  assert.equal(controller.getState().status, TRIP_STATUS.ACCEPTED);
  assert.equal(await controller.cancel(), true);
  assert.equal(calls.cancels, 1);
  assert.equal(controller.getState().finished, TRIP_STATUS.CANCELLED);
  controller.dispose();
});

test('cancel is allowed from driver_arriving', async () => {
  const ctx = makeController();
  await ctx.controller.start();
  assert.equal(ctx.controller.getState().status, TRIP_STATUS.DRIVER_ARRIVING);
  assert.equal(await ctx.controller.cancel(), true);
  assert.equal(ctx.controller.getState().status, TRIP_STATUS.CANCELLED);
  ctx.controller.dispose();
});

test('cancel is allowed from driver_arrived', async () => {
  const ctx = makeController();
  await toAtPickup(ctx);
  assert.equal(ctx.controller.getState().status, TRIP_STATUS.DRIVER_ARRIVED);
  assert.equal(await ctx.controller.cancel(), true);
  assert.equal(ctx.calls.cancels, 1);
  ctx.controller.dispose();
});

test('cancel is rejected in in_progress: no API call, state unchanged', async () => {
  const ctx = makeController();
  await toAtPickup(ctx);
  await ctx.controller.startRide();
  const before = ctx.controller.getState();
  assert.equal(before.status, TRIP_STATUS.IN_PROGRESS);
  assert.equal(await ctx.controller.cancel(), false);
  assert.equal(ctx.calls.cancels, 0);
  const after = ctx.controller.getState();
  assert.equal(after.status, TRIP_STATUS.IN_PROGRESS);
  assert.equal(after.finished, null);
  assert.equal(after.cancelError, false);
  ctx.controller.dispose();
});

test('abandon keeps its result in every phase (CA-005-09)', async () => {
  // Before the destination: cancelled.
  for (const stage of ['accepted', 'toPickup', 'atPickup', 'toDestination']) {
    const ctx = makeController();
    if (stage !== 'accepted') await ctx.controller.start();
    if (stage === 'atPickup' || stage === 'toDestination') {
      ctx.handlers.onEnd();
      await settle();
    }
    if (stage === 'toDestination') {
      await ctx.controller.startRide();
      assert.equal(ctx.controller.getState().phase, TRIP_PHASE.TO_DESTINATION);
    }
    assert.equal(ctx.controller.abandon(), TRIP_STATUS.CANCELLED, stage);
    assert.equal(ctx.controller.getState().abandoned, true);
    assert.equal(ctx.controller.abandon(), TRIP_STATUS.CANCELLED, `${stage} is idempotent`);
    ctx.controller.dispose();
  }
  // At the destination: completed, even though cancel() is now blocked in in_progress.
  const ctx = makeController();
  await ctx.controller.start();
  ctx.handlers.onEnd();
  await settle();
  await ctx.controller.startRide();
  ctx.handlers.onEnd();
  assert.equal(ctx.controller.getState().phase, TRIP_PHASE.AT_DESTINATION);
  assert.equal(ctx.controller.abandon(), TRIP_STATUS.COMPLETED);
  ctx.controller.dispose();
});
