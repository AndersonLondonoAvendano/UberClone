// AI-assisted: see docs/AI_LOG.md #67
// Tests for applySuggestion (T-253; CA-006-09).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createSuggestionApplier } = await import('../../src/i18n/applySuggestion.js');
const { createLanguageStore } = await import('../../src/i18n/languageStore.js');

const setup = (stored) => {
  const saved = [];
  const preference = { get: async () => stored, set: async (v) => { saved.push(v); return true; } };
  const store = createLanguageStore({ preference });
  return { saved, store, apply: createSuggestionApplier({ preference, store }) };
};

test('suggestion en without preference gives en, not saved', async () => {
  const { store, saved, apply } = setup(null);
  assert.equal(await apply('en'), 'en');
  assert.equal(store.getLanguage(), 'en');
  assert.deepEqual(saved, []);
});

test('saved preference es stays es', async () => {
  const { store, apply } = setup('es');
  assert.equal(await apply('en'), null);
  assert.equal(store.getLanguage(), 'es');
});

test('invalid suggestion is ignored', async () => {
  for (const bad of ['fr', '', undefined, null, 5]) {
    const { store, apply } = setup(null);
    assert.equal(await apply(bad), null);
    assert.equal(store.getLanguage(), 'es');
  }
});

test('applies only once', async () => {
  const { store, apply } = setup(null);
  await apply('en');
  store.init('es');
  assert.equal(await apply('en'), null);
  assert.equal(store.getLanguage(), 'es');
});

test('a failing preference read does not throw', async () => {
  const store = createLanguageStore({});
  const apply = createSuggestionApplier({ preference: { get: async () => { throw new Error('x'); } }, store });
  assert.equal(await apply('en'), 'en');
});
