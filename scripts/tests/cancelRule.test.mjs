// AI-assisted: see AI_LOG.md #66
// RE-08 / D-184: the cancel button is offered exactly in accepted, driver_arriving, driver_arrived.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { canOfferCancel } = await import('../../src/services/trip/cancelRule.js');
const { TRIP_STATUS } = await import('../../src/constants/tripStatus.js');

const S = TRIP_STATUS;
const OFFERED = new Set([S.ACCEPTED, S.DRIVER_ARRIVING, S.DRIVER_ARRIVED]);

test('canOfferCancel is true only before in_progress, for every status', () => {
  for (const status of Object.values(S)) {
    assert.equal(canOfferCancel(status), OFFERED.has(status), status);
  }
});

test('canOfferCancel is false for in_progress and for invalid input', () => {
  assert.equal(canOfferCancel(S.IN_PROGRESS), false);
  for (const bad of [undefined, null, '', 'nope', 7]) assert.equal(canOfferCancel(bad), false);
});
