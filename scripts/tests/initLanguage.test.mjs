// AI-assisted: see AI_LOG.md #67
// Tests for initLanguage (T-252; CA-006-08, 10, 19).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { initLanguage } = await import('../../src/i18n/initLanguage.js');
const { createLanguageStore } = await import('../../src/i18n/languageStore.js');

const pref = (get) => ({ get, set: async () => true });
const setup = (get, extra = {}) => {
  const store = createLanguageStore({});
  return { store, run: () => initLanguage({ preference: pref(get), store, ...extra }) };
};

test('saved preference wins over phone', async () => {
  const { store, run } = setup(async () => 'en', { readers: [() => 'es-CO'] });
  assert.equal(await run(), 'en');
  assert.equal(store.getLanguage(), 'en');
});

test('empty preference falls to phone', async () => {
  const { run } = setup(async () => null, { readers: [() => 'en-US'] });
  assert.equal(await run(), 'en');
});

test('empty preference and no phone falls to es', async () => {
  const { run } = setup(async () => null, { readers: [() => 'fr-FR'] });
  assert.equal(await run(), 'es');
});

test('failed read falls to phone', async () => {
  const { run } = setup(async () => { throw new Error('boom'); }, { readers: [() => 'en'] });
  assert.equal(await run(), 'en');
});

test('slow read is capped and falls to phone', async () => {
  const { run } = setup(() => new Promise(() => {}), { readers: [() => 'en'], timeoutMs: 40 });
  const start = Date.now();
  assert.equal(await run(), 'en');
  assert.ok(Date.now() - start < 500);
});

test('default cap is 1.5 s', async () => {
  const { READ_TIMEOUT_MS } = await import('../../src/i18n/initLanguage.js');
  assert.equal(READ_TIMEOUT_MS, 1500);
});

test('saved preference beats suggestion; suggestion beats phone', async () => {
  assert.equal(await setup(async () => 'es', { suggested: 'en' }).run(), 'es');
  assert.equal(await setup(async () => null, { suggested: 'en', readers: [() => 'es'] }).run(), 'en');
});

test('init does not save the resolved language', async () => {
  let saved = 0;
  const store = createLanguageStore({ preference: { get: async () => null, set: async () => { saved++; return true; } } });
  await initLanguage({ preference: pref(async () => null), store, readers: [() => 'en'] });
  assert.equal(saved, 0);
});
