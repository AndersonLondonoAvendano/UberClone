// AI-assisted: see docs/AI_LOG.md #67
// Pure tests for normalizeLanguage, resolveLanguage and readPhoneLanguage (T-242; CA-006-08, 09, 10).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { normalizeLanguage } = await import('../../src/i18n/languages.js');
const { resolveLanguage } = await import('../../src/i18n/resolveLanguage.js');
const { readPhoneLanguage } = await import('../../src/i18n/phoneLanguage.js');

test('normalizeLanguage uses the base code', () => {
  for (const [input, expected] of [
    ['es', 'es'], ['es_CO', 'es'], ['es-419', 'es'], ['en-GB', 'en'], ['en_US', 'en'], ['EN', 'en'],
    ['fr', null], ['pt-BR', null], ['', null], [null, null], [undefined, null], [5, null], [{}, null],
  ]) {
    assert.equal(normalizeLanguage(input), expected, String(input));
  }
});

test('resolveLanguage table (CA-006-08)', () => {
  assert.equal(resolveLanguage({ stored: 'en', phone: 'es' }), 'en');
  assert.equal(resolveLanguage({ phone: 'en-US' }), 'en');
  assert.equal(resolveLanguage({ phone: 'fr' }), 'es');
  assert.equal(resolveLanguage({ stored: 'fr', phone: 'en' }), 'en');
  assert.equal(resolveLanguage({}), 'es');
  assert.equal(resolveLanguage(), 'es');
  assert.equal(resolveLanguage({ stored: '', suggested: 5, phone: null }), 'es');
});

test('registration suggestion sits between stored and phone (CA-006-09)', () => {
  assert.equal(resolveLanguage({ suggested: 'en', phone: 'es' }), 'en');
  assert.equal(resolveLanguage({ stored: 'es', suggested: 'en', phone: 'en' }), 'es');
  assert.equal(resolveLanguage({ suggested: 'xx', phone: 'en' }), 'en');
});

test('readPhoneLanguage skips failing readers and never throws (CA-006-10)', () => {
  assert.equal(readPhoneLanguage([() => { throw new Error('boom'); }, () => 'en_GB']), 'en');
  assert.equal(readPhoneLanguage([() => { throw new Error('boom'); }]), null);
  assert.equal(readPhoneLanguage([() => null, () => 'fr', () => undefined]), null);
  assert.equal(readPhoneLanguage([() => 'fr-FR', () => 'es-CO']), 'es');
  assert.equal(readPhoneLanguage([]), null);
  assert.equal(readPhoneLanguage(null), null);
  assert.equal(resolveLanguage({ phone: readPhoneLanguage([() => { throw new Error('x'); }]) }), 'es');
});

test('real readers do not throw outside React Native', () => {
  const result = readPhoneLanguage();
  assert.ok(result === null || result === 'es' || result === 'en');
});
