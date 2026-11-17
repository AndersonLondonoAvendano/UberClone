// AI-assisted: see AI_LOG.md #60
// Tests for deriveRegistrationProgress / shouldShowWelcome. Run:
//   node --import ./scripts/tests/helpers/registerSrcLoader.mjs --test scripts/tests/registrationProgress.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deriveRegistrationProgress, shouldShowWelcome } from '../../src/utils/registrationProgress.js';

const flags = (a, b, c) => ({ isPersonalDataValid: a, isVehicleValid: b, isDocumentsValid: c });

test('nothing complete: starts at personal data', () => {
  const p = deriveRegistrationProgress(flags(false, false, false));
  assert.equal(p.completedCount, 0);
  assert.equal(p.total, 3);
  assert.equal(p.firstIncompleteKey, 'personalData');
  assert.equal(p.startRoute, 'PersonalData');
  assert.equal(p.action, 'start');
  assert.equal(p.allComplete, false);
});

test('first incomplete is the first missing step, not the count', () => {
  const p = deriveRegistrationProgress(flags(true, false, true));
  assert.equal(p.completedCount, 2);
  assert.equal(p.firstIncompleteKey, 'vehicle');
  assert.equal(p.startRoute, 'Vehicle');
  assert.equal(p.action, 'continue');
  assert.deepEqual(p.steps.map((s) => s.complete), [true, false, true]);
});

test('all complete: review at the documents tab', () => {
  const p = deriveRegistrationProgress(flags(true, true, true));
  assert.equal(p.allComplete, true);
  assert.equal(p.firstIncompleteKey, null);
  assert.equal(p.startRoute, 'Documents');
  assert.equal(p.action, 'review');
});

test('missing or non-boolean flags count as incomplete', () => {
  const p = deriveRegistrationProgress(undefined);
  assert.equal(p.completedCount, 0);
  assert.equal(deriveRegistrationProgress({ isPersonalDataValid: 'yes' }).completedCount, 0);
});

test('welcome shows only while the registration is not sent', () => {
  assert.equal(shouldShowWelcome({ accountStatus: null, submitState: 'idle' }), true);
  assert.equal(shouldShowWelcome({ accountStatus: 'registration', submitState: 'error' }), true);
  assert.equal(shouldShowWelcome({ accountStatus: 'pending', submitState: 'idle' }), false);
  assert.equal(shouldShowWelcome({ accountStatus: 'approved', submitState: 'idle' }), false);
  assert.equal(shouldShowWelcome({ accountStatus: null, submitState: 'success' }), false);
});
