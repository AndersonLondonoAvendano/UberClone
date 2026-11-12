// AI-assisted: see docs/AI_LOG.md #60
// Plain Node tests for src/utils/vehicleColor.js (CA-002-139, D-100). Run:
//   node scripts/tests/vehicleColor.test.mjs
import './helpers/registerSrcLoader.mjs';
import assert from 'node:assert/strict';

const { vehicleColorToken, vehicleBadgeToken, contrastRatio } = await import('../../src/utils/vehicleColor.js');
const { VEHICLE_COLOR_OPTIONS } = await import('../../src/constants/registrationOptions.js');
const { color, vehicleColor, carMarker } = await import('../../src/theme/tokens.js');

// Every registration option resolves: known -> its token, 'otro' -> brand colour.
for (const { value } of VEHICLE_COLOR_OPTIONS) {
  const expected = value === 'otro' ? color.primary : vehicleColor[value];
  assert.equal(vehicleColorToken(value), expected, value);
  const badge = vehicleBadgeToken(value);
  assert.ok(badge === carMarker.badgeLight || badge === carMarker.badgeDark, value);
  // The glyph keeps >= 3:1 against the badge it is drawn on.
  assert.ok(contrastRatio(vehicleColorToken(value), badge) >= carMarker.minGlyphContrast, `contrast ${value}`);
}

// "Blanco" in every form (accents, case, spaces) is the white token on the dark badge.
for (const v of ['blanco', 'Blanco', 'BLANCO', '  Blanco  ', 'bláncó', 'BLÁNCO ']) {
  assert.equal(vehicleColorToken(v), vehicleColor.blanco, JSON.stringify(v));
  assert.equal(vehicleBadgeToken(v), carMarker.badgeDark, JSON.stringify(v));
}

// Unknown, empty, null, 'otro' -> brand colour.
for (const v of ['otro', 'Otro', 'turquesa', '', '   ', null, undefined, 42]) {
  assert.equal(vehicleColorToken(v), color.primary, String(v));
}
// Inherited keys are not colours.
assert.equal(vehicleColorToken('constructor'), color.primary);
assert.equal(vehicleColorToken('toString'), color.primary);

// After saving, the colour is computed from the current profile (no cached value).
const tokenOf = (profile) => vehicleColorToken(profile?.vehicle?.color);
const before = { vehicle: { color: 'rojo' } };
const after = { vehicle: { ...before.vehicle, color: 'Blanco' } };
assert.equal(tokenOf(before), vehicleColor.rojo);
assert.equal(tokenOf(after), vehicleColor.blanco);
assert.equal(tokenOf(null), color.primary);
assert.equal(tokenOf({}), color.primary);

console.log('vehicleColor.test.mjs OK');
