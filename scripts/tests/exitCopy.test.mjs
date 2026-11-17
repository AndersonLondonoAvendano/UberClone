// AI-assisted: see docs/AI_LOG.md #66
// C2c: the "Salir del viaje" text matches what happens in each state.
import assert from 'node:assert/strict';
import test from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { exitCopy } = await import('../../src/services/trip/exitCopy.js');
const { labels } = await import('../../src/constants/labels.js');

test('in_progress mid-ride: cancelled and without charge, no "sin la confirmación del servidor"', () => {
  const copy = exitCopy({ status: 'in_progress', atDestination: false, serverError: false });
  assert.doesNotMatch(copy.question, /confirmación del servidor/);
  assert.match(copy.message, /cancelado/);
  assert.match(copy.message, /sin cobro/);
  // Even with a server error on screen, mid-ride the trip is cancelled without charge.
  const withError = exitCopy({ status: 'in_progress', atDestination: false, serverError: true });
  assert.match(withError.message, /cancelado y sin cobro/);
  assert.doesNotMatch(withError.question, /confirmación del servidor/);
});

test('before the ride, without a server error the question is plain; with one it names the server', () => {
  for (const status of ['accepted', 'driver_arriving', 'driver_arrived']) {
    const plain = exitCopy({ status, serverError: false });
    assert.equal(plain.question, labels.trip.exitQuestionPlain);
    assert.match(plain.message, /cancelado y sin cobro/);
    const failed = exitCopy({ status, serverError: true });
    assert.equal(failed.question, labels.trip.exitQuestionServer);
    assert.match(failed.message, /cancelado y sin cobro/);
  }
});

test('at the destination (finish failed): server wording and no charge registered', () => {
  const copy = exitCopy({ status: 'in_progress', atDestination: true, serverError: true });
  assert.equal(copy.question, labels.trip.exitQuestionServer);
  assert.match(copy.message, /no se registra el cobro/);
  assert.doesNotMatch(copy.message, /cancelado/);
});
