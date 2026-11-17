// AI-assisted: see AI_LOG.md #66
// C2d (D-181): going "No disponible" with a request open says "Cancelada: ya no estás disponible",
// not "La solicitud expiró"; a real expiry keeps its text.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { requestClosedReason, closedReasonText, CLOSED_REASON } = await import('../../src/services/trip/requestClosed.js');
const { labels } = await import('../../src/constants/labels.js');

test('unavailable with time left: the request was cancelled by the driver going offline', () => {
  const reason = requestClosedReason({ available: false, remainingMs: 8000 });
  assert.equal(reason, CLOSED_REASON.UNAVAILABLE);
  assert.equal(closedReasonText(reason), 'Cancelada: ya no estás disponible');
  assert.equal(closedReasonText(reason), labels.trip.closedUnavailable);
  assert.notEqual(closedReasonText(reason), labels.trip.expired);
});

test('A2: the full-screen notice icon is neutral information when unavailable and the clock only for an expiry', async () => {
  const { closedReasonIcon } = await import('../../src/services/trip/requestClosed.js');
  assert.equal(closedReasonIcon(CLOSED_REASON.UNAVAILABLE), 'information-circle-outline');
  assert.notEqual(closedReasonIcon(CLOSED_REASON.UNAVAILABLE), 'time-outline');
  assert.equal(closedReasonIcon(CLOSED_REASON.EXPIRED), 'time-outline');
});

test('a real expiry keeps "La solicitud expiró", even if the driver is unavailable by then', () => {
  assert.equal(closedReasonText(requestClosedReason({ available: true, remainingMs: 0 })), 'La solicitud expiró');
  assert.equal(closedReasonText(requestClosedReason({ available: false, remainingMs: 0 })), 'La solicitud expiró');
  assert.equal(closedReasonText(requestClosedReason({ available: undefined, remainingMs: 8000 })), 'La solicitud expiró');
  assert.equal(requestClosedReason({ available: false, remainingMs: 1000, toleranceMs: 1500 }), CLOSED_REASON.EXPIRED);
  assert.equal(requestClosedReason({ available: false, remainingMs: 1600, toleranceMs: 1500 }), CLOSED_REASON.UNAVAILABLE);
});
