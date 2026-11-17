// AI-assisted: see AI_LOG.md #67
// Tests for the active-language store (T-243; CA-006-15, 17, 19 store part).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createLanguageStore } = await import('../../src/i18n/languageStore.js');
const { createLanguagePreference } = await import('../../src/i18n/languagePreference.js');

const memoryStorage = () => {
  const map = new Map();
  return { map, getItem: async (k) => map.get(k) ?? null, setItem: async (k, v) => void map.set(k, v) };
};
const make = (storage = memoryStorage(), initial) => ({
  storage,
  store: createLanguageStore({ preference: createLanguagePreference({ storage }), initial }),
});

test('starts in es and init does not save', async () => {
  const { store, storage } = make();
  assert.equal(store.getLanguage(), 'es');
  store.init('en');
  assert.equal(store.getLanguage(), 'en');
  assert.equal(storage.map.size, 0);
});

test('setLanguage changes at once, notifies, then saves', async () => {
  const { store, storage } = make();
  const seen = [];
  store.subscribe((l) => seen.push(l));
  const pending = store.setLanguage('en');
  assert.equal(store.getLanguage(), 'en');
  assert.deepEqual(seen, ['en']);
  assert.deepEqual(await pending, { saved: true });
  assert.equal(storage.map.get('appLanguage'), 'en');
});

test('unsubscribe stops notifications; same language does not notify', async () => {
  const { store } = make();
  const seen = [];
  const off = store.subscribe((l) => seen.push(l));
  await store.setLanguage('es');
  assert.deepEqual(seen, []);
  off();
  await store.setLanguage('en');
  assert.deepEqual(seen, []);
});

test('a throwing subscriber does not block the others', async () => {
  const { store } = make();
  const seen = [];
  store.subscribe(() => { throw new Error('bad'); });
  store.subscribe((l) => seen.push(l));
  await store.setLanguage('en');
  assert.deepEqual(seen, ['en']);
});

test('failing storage: language changes, saved is false, no throw (CA-006-17)', async () => {
  const storage = {
    getItem: async () => { throw new Error('r'); },
    setItem: async () => { throw new Error('w'); },
  };
  const { store } = make(storage);
  assert.deepEqual(await store.setLanguage('en'), { saved: false });
  assert.equal(store.getLanguage(), 'en');
  const throwingPref = { set: () => { throw new Error('sync'); } };
  const s2 = createLanguageStore({ preference: throwingPref });
  assert.deepEqual(await s2.setLanguage('en'), { saved: false });
  assert.equal(s2.getLanguage(), 'en');
});

test('two quick changes: the last one wins and stays stored', async () => {
  const storage = memoryStorage();
  const slow = {
    ...storage,
    setItem: async (k, v) => {
      if (v === 'en') await new Promise((r) => setTimeout(r, 20));
      storage.map.set(k, v);
    },
  };
  const { store } = make(slow);
  const a = store.setLanguage('en');
  const b = store.setLanguage('es');
  assert.equal(store.getLanguage(), 'es');
  await Promise.all([a, b]);
  assert.equal(storage.map.get('appLanguage'), 'es');
});

test('invalid values are ignored', async () => {
  const { store, storage } = make();
  for (const bad of ['fr', '', null, 5, undefined]) {
    assert.deepEqual(await store.setLanguage(bad), { saved: false });
  }
  assert.equal(store.getLanguage(), 'es');
  assert.equal(storage.map.size, 0);
});
