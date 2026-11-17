// AI-assisted: see docs/AI_LOG.md #70
// Plain Node test for chooseRequestSource (T-275, CA-007-13): every combination.
//   node scripts/tests/requestSource.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { chooseRequestSource, REQUEST_SOURCE } = await import('../../src/services/notifications/requestSource.js');

const bools = [false, true];
let combos = 0;
for (const available of bools)
  for (const onTrip of bools)
    for (const notificationsReady of bools)
      for (const backendConfirmed of bools) {
        combos += 1;
        const source = chooseRequestSource({ available, onTrip, notificationsReady, backendConfirmed });
        const label = JSON.stringify({ available, onTrip, notificationsReady, backendConfirmed });
        let expected;
        if (!available || onTrip) expected = 'none';
        else if (notificationsReady && backendConfirmed) expected = 'server';
        else expected = 'mock';
        assert.equal(source, expected, label);
        assert.ok(Object.values(REQUEST_SOURCE).includes(source), label);
        // Exactly one source while available without a trip; none otherwise.
        const active = [source === 'server', source === 'mock'].filter(Boolean).length;
        assert.equal(active, available && !onTrip ? 1 : 0, label);
      }
assert.equal(combos, 16);

// Missing or non-boolean inputs never produce a source while available is not strictly true.
assert.equal(chooseRequestSource(), 'none');
assert.equal(chooseRequestSource({}), 'none');
assert.equal(chooseRequestSource({ available: 'yes', notificationsReady: true, backendConfirmed: true }), 'none');
// Available without trip and unknown readiness falls back to mock, never to zero sources.
assert.equal(chooseRequestSource({ available: true }), 'mock');
assert.equal(chooseRequestSource({ available: true, notificationsReady: true }), 'mock');
assert.equal(chooseRequestSource({ available: true, backendConfirmed: true }), 'mock');

console.log('requestSource: OK');
