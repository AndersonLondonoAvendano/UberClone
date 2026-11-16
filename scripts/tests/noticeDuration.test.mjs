// AI-assisted: see docs/AI_LOG.md #67
// A3: the notice of the request card lasts base x font scale, at most 6 s.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { noticeDurationMs, NOTICE_MAX_MS } = await import('../../src/services/trip/noticeDuration.js');
const { EXPIRED_NOTICE_MS } = await import('../../src/config/trip.js');

test('scale 1 keeps the base time; a smaller or invalid scale never shortens it', () => {
  assert.equal(noticeDurationMs(EXPIRED_NOTICE_MS, 1), 2500);
  for (const bad of [0.8, 0, -1, NaN, undefined, null, '2']) assert.equal(noticeDurationMs(EXPIRED_NOTICE_MS, bad), 2500);
});

test('it grows with the font scale: 1.3 -> 3250 ms, 2.0 -> 5000 ms', () => {
  assert.equal(noticeDurationMs(EXPIRED_NOTICE_MS, 1.3), 3250);
  assert.equal(noticeDurationMs(EXPIRED_NOTICE_MS, 2), 5000);
});

test('it is capped at 6 s', () => {
  assert.equal(NOTICE_MAX_MS, 6000);
  assert.equal(noticeDurationMs(EXPIRED_NOTICE_MS, 3), 6000);
  assert.equal(noticeDurationMs(EXPIRED_NOTICE_MS, 10), 6000);
});
