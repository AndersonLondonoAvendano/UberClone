// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #68
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

// CA-006-48: injected zone. 2026-11-11 19:05 UTC is 14:05 in UTC-5.
const instant = Date.UTC(2026, 10, 11, 19, 5);
const utc5 = { utcOffsetMinutes: -300 };
const utc0 = { utcOffsetMinutes: 0 };

test('same instant gives different correct hours in UTC-5 and UTC+0, in es and en (CA-006-48)', () => {
  assert.equal(formatClock(instant, 'es', utc5), '14:05');
  assert.equal(formatClock(instant, 'es', utc0), '19:05');
  assert.equal(formatClock(instant, 'en', utc5), '2:05 PM');
  assert.equal(formatClock(instant, 'en', utc0), '7:05 PM');
  assert.equal(formatDateTime(instant, 'es', utc5), '11/11/2026 14:05');
  assert.equal(formatDateTime(instant, 'en', utc0), '11/11/2026 7:05 PM');
});

test('the injected zone can change the date (day rollover)', () => {
  const late = Date.UTC(2026, 10, 12, 2, 30);
  assert.equal(formatDateTime(late, 'es', utc5), '11/11/2026 21:30');
  assert.equal(formatDateTime(late, 'en', utc5), '11/11/2026 9:30 PM');
  assert.equal(formatDateTime(late, 'es', utc0), '12/11/2026 02:30');
  assert.equal(formatDateTime(late, 'en', utc0), '11/12/2026 2:30 AM');
});

test('without an injected zone the phone local time is used', () => {
  assert.equal(formatDateTime(afternoon, 'es', {}), '11/11/2026 14:05');
  assert.equal(formatDateTime(afternoon, 'es', { utcOffsetMinutes: 'x' }), '11/11/2026 14:05');
  assert.equal(formatClock(afternoon, 'en', undefined), '2:05 PM');
});
