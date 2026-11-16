// Tests for normalizePlate / isValidPlate (T-174, RF-67). Run:
//   node --import ./scripts/tests/helpers/registerSrcLoader.mjs --test scripts/tests/plateNormalization.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizePlate, isValidPlate } from '../../src/utils/validators.js';

test('normalizePlate maps the documented cases', () => {
  const table = [
    ['AB', 'AB'],
    ['ab', 'AB'],
    ['a b', 'AB'],
    ['ABC-123', 'ABC123'],
    [' abc 123 ', 'ABC123'],
    ['', ''],
  ];
  for (const [input, expected] of table) {
    assert.equal(normalizePlate(input), expected, JSON.stringify(input));
  }
});

test('normalizePlate returns an empty string for non-strings', () => {
  for (const input of [null, undefined, 123, {}, []]) {
    assert.equal(normalizePlate(input), '');
  }
});

test('normalizePlate is idempotent', () => {
  for (const input of ['AB', 'a b', 'ABC-123', ' abc 123 ', '']) {
    assert.equal(normalizePlate(normalizePlate(input)), normalizePlate(input));
  }
});

test('isValidPlate works on normalized values', () => {
  assert.equal(isValidPlate(normalizePlate('abc-123')), true);
  assert.equal(isValidPlate('ABC12'), false);
});
