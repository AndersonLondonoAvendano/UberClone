// AI-assisted: see docs/AI_LOG.md #57
// Plain Node tests for the legacy-trip helpers (T-122, CA-002-94, RF-54). Run: node scripts/tests/legacyTrip.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { isLegacySimulatedTrip, legacyPaymentChip } = await import('../../src/services/trip/legacyTrip.js');
const { labels } = await import('../../src/constants/labels.js');

// Legacy only when BOTH payment fields are missing.
assert.equal(isLegacySimulatedTrip({ status: 'completed' }), true);
assert.equal(isLegacySimulatedTrip({ status: 'paid', paymentMethod: null, paymentStatus: undefined }), true);
assert.equal(isLegacySimulatedTrip({ paymentMethod: 'cash' }), false, 'method only');
assert.equal(isLegacySimulatedTrip({ paymentStatus: 'pending' }), false, 'status only');
assert.equal(isLegacySimulatedTrip({ paymentMethod: 'mercadopago', paymentStatus: 'approved' }), false);
assert.equal(isLegacySimulatedTrip(null), false);
assert.equal(isLegacySimulatedTrip(undefined), false);
assert.equal(isLegacySimulatedTrip(5), false);

// Chip: neutral, with the TEXT "Cobro simulado" (not "Pago sin estado"), only for legacy trips.
const chip = legacyPaymentChip({ status: 'completed' });
assert.equal(chip.label, 'Cobro simulado');
assert.equal(chip.tone, 'neutral');
assert.ok(chip.icon, 'icon next to the text');
assert.notEqual(chip.label, labels.history.paymentUnknown);
assert.equal(legacyPaymentChip({ paymentMethod: 'cash' }), null);
assert.equal(legacyPaymentChip({ paymentStatus: 'paid' }), null);
assert.equal(legacyPaymentChip(null), null);
console.log('legacyTrip tests ok');
