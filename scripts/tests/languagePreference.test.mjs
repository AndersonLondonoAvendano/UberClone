// AI-assisted: see AI_LOG.md #67
// Tests for the appLanguage preference with injected storage (T-242; CA-006-15).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createLanguagePreference, LANGUAGE_KEY } = await import('../../src/i18n/languagePreference.js');

const memoryStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  return { map, getItem: async (k) => (map.has(k) ? map.get(k) : null), setItem: async (k, v) => void map.set(k, v) };
};
const failingStorage = {
  getItem: async () => { throw new Error('read'); },
  setItem: async () => { throw new Error('write'); },
};

test('set then get round-trips es and en under appLanguage', async () => {
  const storage = memoryStorage();
  const pref = createLanguagePreference({ storage });
  assert.equal(LANGUAGE_KEY, 'appLanguage');
  assert.equal(await pref.get(), null);
  assert.equal(await pref.set('en'), true);
  assert.equal(storage.map.get('appLanguage'), 'en');
  assert.equal(await createLanguagePreference({ storage }).get(), 'en');
  assert.equal(await pref.set('es'), true);
  assert.equal(await pref.get(), 'es');
});

test('corrupt stored values read as null', async () => {
  for (const raw of ['fr', '', '5', 'EN', 'es-CO', 7, {}]) {
    const pref = createLanguagePreference({ storage: memoryStorage({ appLanguage: raw }) });
    assert.equal(await pref.get(), null, String(raw));
  }
});

test('an unsupported language is not stored', async () => {
  const storage = memoryStorage();
  const pref = createLanguagePreference({ storage });
  assert.equal(await pref.set('fr'), false);
  assert.equal(await pref.set(null), false);
  assert.equal(storage.map.size, 0);
});

test('a failing storage never throws', async () => {
  const pref = createLanguagePreference({ storage: failingStorage });
  assert.equal(await pref.get(), null);
  assert.equal(await pref.set('en'), false);
});
