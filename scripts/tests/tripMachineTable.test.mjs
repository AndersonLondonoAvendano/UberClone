// AI-assisted: see docs/AI_LOG.md #66
// T-221 (CA-005-07, CA-005-16): canTransition equals the table of spec 005 section 4, cell by cell.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { canTransition, TRANSITIONS } = await import('../../src/services/trip/tripMachine.js');
const { TRIP_STATUS, PAYMENT_STATUS } = await import('../../src/constants/tripStatus.js');

const S = TRIP_STATUS;
const ALL = Object.values(S);

// Written independently of the implementation: the valid pairs of the spec table.
const VALID = new Set([
  [S.REQUESTED, S.ACCEPTED],
  [S.REQUESTED, S.REJECTED],
  [S.ACCEPTED, S.DRIVER_ARRIVING],
  [S.ACCEPTED, S.CANCELLED],
  [S.DRIVER_ARRIVING, S.DRIVER_ARRIVED],
  [S.DRIVER_ARRIVING, S.CANCELLED],
  [S.DRIVER_ARRIVED, S.IN_PROGRESS],
  [S.DRIVER_ARRIVED, S.CANCELLED],
  [S.IN_PROGRESS, S.COMPLETED],
  [S.COMPLETED, S.PAID],
].map(([from, to]) => `${from}>${to}`));

test('the constants exist with the spec values', () => {
  assert.equal(S.REQUESTED, 'requested');
  assert.equal(S.REJECTED, 'rejected');
  assert.equal(ALL.length, 9);
});

test('every pair of states matches the table', () => {
  let validCount = 0;
  for (const from of ALL) {
    for (const to of ALL) {
      const expected = VALID.has(`${from}>${to}`);
      assert.equal(canTransition(from, to), expected, `${from} -> ${to}`);
      if (expected) validCount += 1;
    }
  }
  assert.equal(validCount, VALID.size);
});

test('terminal states and the ongoing ride', () => {
  for (const terminal of [S.REJECTED, S.CANCELLED, S.PAID]) {
    for (const to of ALL) assert.equal(canTransition(terminal, to), false, `${terminal} -> ${to}`);
  }
  assert.equal(canTransition(S.IN_PROGRESS, S.CANCELLED), false);
  for (const to of ALL) assert.equal(canTransition(to, S.REQUESTED), false, `nothing goes back to requested (${to})`);
  for (const status of ALL) assert.equal(canTransition(status, status), false, `${status} -> itself`);
});

test('null, empty, unknown and prototype keys are invalid', () => {
  const junk = [null, undefined, '', 'unknown', 'toString', '__proto__', 'constructor', 0, {}, []];
  for (const bad of junk) {
    for (const ok of ALL) {
      assert.equal(canTransition(bad, ok), false);
      assert.equal(canTransition(ok, bad), false);
    }
    assert.equal(canTransition(bad, bad), false);
  }
});

test('the table covers every state and the payment status is a different thing', () => {
  assert.deepEqual(Object.keys(TRANSITIONS).sort(), [...ALL].sort());
  assert.equal(PAYMENT_STATUS.REJECTED, 'rejected');
});
