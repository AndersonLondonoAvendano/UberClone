// AI-assisted: see AI_LOG.md #55
// Plain Node tests for src/utils/documentValidators.js (CA-002-51, CA-002-52). Run:
//   node scripts/tests/documentValidators.test.mjs
import assert from 'node:assert/strict';
import { validateExpiry, requiresTechnicalReview, validateLicenseNumber } from '../../src/utils/documentValidators.js';

// 2026-11-11 12:00 in Colombia (17:00 UTC).
const NOW = new Date('2026-11-11T17:00:00Z');

// CA-002-51: only "tomorrow" is valid.
const expiryTable = [
  ['hoy', '2026-11-11', false],
  ['ayer', '2026-11-10', false],
  ['manana', '2026-11-12', true],
  ['Date manana', new Date(2026, 10, 12), true],
  ['Date hoy', new Date(2026, 10, 11), false],
  ['vacio', '', false],
  ['null', null, false],
  ['undefined', undefined, false],
  ['invalida', 'no-es-fecha', false],
  ['dia inexistente', '2026-02-31', false],
  ['Date invalida', new Date('x'), false],
];
for (const [name, value, expected] of expiryTable) {
  const result = validateExpiry(value, NOW);
  assert.equal(result.valid, expected, `validateExpiry ${name}`);
  if (expected) assert.equal(result.error, null, `error vacio ${name}`);
  else assert.ok(typeof result.error === 'string' && result.error.length > 0, `texto de error ${name}`);
}

// Colombia boundary (UTC-5): 2026-11-12T03:00Z is still 2026-11-11 in Colombia, so 11-12 is valid;
// 2026-11-12T05:00Z is already 2026-11-12 there, so 11-12 is not valid.
assert.equal(validateExpiry('2026-11-12', new Date('2026-11-12T03:00:00Z')).valid, true, 'frontera 22:00 Colombia');
assert.equal(validateExpiry('2026-11-12', new Date('2026-11-12T05:00:00Z')).valid, false, 'frontera 00:00 Colombia');
assert.equal(validateExpiry('2026-11-12', new Date('2026-11-12T04:59:59Z')).valid, true, 'frontera 23:59:59 Colombia');

// CA-002-52: current year 2026.
const reviewTable = [
  [2022, false],
  [2021, true],
  [2020, true],
  [2026, false],
  ['', true],
  [null, true],
  [undefined, true],
  ['abc', true],
  [2027, true],
  [2030, true],
  [20.5, true],
];
for (const [year, expected] of reviewTable) {
  const result = requiresTechnicalReview(year, 2026);
  assert.equal(result.required, expected, `requiresTechnicalReview ${String(year)}`);
  if (expected) assert.equal(result.reason, null, `sin motivo cuando se exige ${String(year)}`);
  else assert.ok(typeof result.reason === 'string' && result.reason.length > 0, `motivo ${String(year)}`);
}
assert.equal(requiresTechnicalReview('2020', 2026).required, true, 'anio como texto numerico');
assert.equal(requiresTechnicalReview('2024', 2026).required, false, 'anio como texto numerico reciente');

// License number.
const licenseTable = [
  ['12345678', true],
  ['  AB12345 ', true],
  ['1234', false],
  ['', false],
  [null, false],
  ['12 345 678', false],
  ['A'.repeat(21), false],
  [12345678, false],
];
for (const [value, expected] of licenseTable) {
  const result = validateLicenseNumber(value);
  assert.equal(result.valid, expected, `validateLicenseNumber ${String(value)}`);
  assert.equal(result.error === null, expected, `error licencia ${String(value)}`);
}

console.log('ok');
