// AI-assisted: see docs/AI_LOG.md #67
// T-251: per-language formats (CA-006-28, 29, 30). Instants are built from local parts, so any time zone works.
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { formatCop, formatKm, formatKmFromMeters, formatClock, formatDateTime, formatMinutesFromSeconds } =
  await import('../../src/utils/format.js');
const { init } = await import('../../src/i18n/languageStore.js');

const afternoon = new Date(2026, 10, 11, 14, 5).getTime();
const midnight = new Date(2026, 10, 3, 0, 7).getTime();
const noon = new Date(2026, 10, 3, 12, 30).getTime();

test('formatCop is the same in both languages (CA-006-28)', () => {
  assert.equal(formatCop(19200), '$ 19.200');
  assert.equal(formatCop(0), '$ 0');
  assert.equal(formatCop(1234567), '$ 1.234.567');
});

test('kilometers: comma in es, point in en (CA-006-30)', () => {
  assert.equal(`${formatKm(8.5, 'es')} km`, '8,5 km');
  assert.equal(`${formatKm(8.5, 'en')} km`, '8.5 km');
  assert.equal(formatKmFromMeters(2350, 'es'), '2,4');
  assert.equal(formatKmFromMeters(2350, 'en'), '2.4');
  assert.equal(formatKmFromMeters(-5, 'en'), '0.0');
  assert.equal(formatKmFromMeters('x', 'es'), '0,0');
});

test('minutes are the same in both languages', () => {
  assert.equal(`${formatMinutesFromSeconds(1320)} min`, '22 min');
});

test('date and time differ by language for the same instant (CA-006-29)', () => {
  assert.equal(formatDateTime(afternoon, 'es'), '11/11/2026 14:05');
  assert.equal(formatDateTime(afternoon, 'en'), '11/11/2026 2:05 PM');
  const day = new Date(2026, 10, 3, 9, 0).getTime();
  assert.equal(formatDateTime(day, 'es'), '03/11/2026 09:00');
  assert.equal(formatDateTime(day, 'en'), '11/03/2026 9:00 AM');
  assert.equal(formatClock(afternoon, 'es'), '14:05');
  assert.equal(formatClock(afternoon, 'en'), '2:05 PM');
  assert.equal(formatClock(midnight, 'en'), '12:07 AM');
  assert.equal(formatClock(noon, 'en'), '12:30 PM');
  assert.equal(formatClock(midnight, 'es'), '00:07');
});

test('unknown dates give empty text in both languages', () => {
  for (const language of ['es', 'en']) {
    assert.equal(formatClock(null, language), '');
    assert.equal(formatDateTime('abc', language), '');
  }
});

test('Firestore timestamps still work', () => {
  assert.equal(formatClock({ toMillis: () => afternoon }, 'en'), '2:05 PM');
});

test('without a language argument the active language is read at call time; unsupported falls back to it', () => {
  init('es');
  assert.equal(formatKm(8.5), '8,5');
  assert.equal(formatClock(afternoon), '14:05');
  init('en');
  assert.equal(formatKm(8.5), '8.5');
  assert.equal(formatClock(afternoon), '2:05 PM');
  assert.equal(formatKm(8.5, 'fr'), '8.5');
  init('es');
  assert.equal(formatKm(8.5, 'fr'), '8,5');
});
