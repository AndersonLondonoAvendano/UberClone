// AI-assisted: see docs/AI_LOG.md #67
// Language selector in Settings (T-254; CA-006-12, 13, 14, 17, D3). The component is checked by reading its
// source (there is no renderer in the test setup); the save-failure path runs on the real store.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/registerSrcLoader.mjs';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const section = read('src/components/settings/LanguageSection.js');
const screen = read('src/screens/main/SettingsScreen.js');
const { es } = await import('../../src/i18n/dictionaries/es.js');
const { en } = await import('../../src/i18n/dictionaries/en/index.js');
const { createLanguageStore } = await import('../../src/i18n/languageStore.js');
const { touch } = await import('../../src/theme/tokens.js');

test('CA-006-12: fixed title and two options in their own language, same in es and en', () => {
  for (const d of [es, en]) {
    assert.equal(d.settings.language.title, 'Idioma / Language');
    assert.equal(d.settings.language.optionEs, 'Español');
    assert.equal(d.settings.language.optionEn, 'English');
  }
  assert.deepEqual(Object.keys(es.settings.language), Object.keys(en.settings.language));
  assert.match(section, /accessibilityRole="header"/);
  assert.match(section, /code: 'es'/);
  assert.match(section, /code: 'en'/);
});

test('CA-006-13: radio role, selected state, check icon plus text, area >= 48 dp', () => {
  assert.match(section, /accessibilityRole="radio"/);
  assert.match(section, /accessibilityState=\{\{ selected, checked: selected \}\}/);
  assert.match(section, /selected \? \(/);
  assert.match(section, /name="checkmark-circle"/);
  assert.match(section, /text\.active/);
  assert.match(section, /minHeight: touch\.controlHeight/);
  assert.ok(touch.controlHeight >= 48);
});

test('CA-006-13/D3: no Alert, tokens only, no hex colours, existing components', () => {
  assert.doesNotMatch(section, /\bAlert\b/);
  assert.doesNotMatch(section, /#[0-9a-fA-F]{3,8}\b/);
  assert.match(section, /from '\.\.\/Card'/);
  assert.match(section, /from '\.\.\/Icon'/);
  assert.match(screen, /<LanguageSection \/>/);
  assert.match(screen, /useLanguage\(\)/);
});

test('CA-006-14: no remote write, validProfileEdit and firestore.rules untouched by the language', () => {
  assert.doesNotMatch(section, /firestore|firebase|fetch\(|profileRepository|validProfileEdit/i);
  assert.match(section, /setLanguage/);
  assert.doesNotMatch(read('firestore.rules'), /appLanguage/);
});

test('CA-006-17: a failing save still changes the language and gives saved:false, which shows the notice', async () => {
  const store = createLanguageStore({
    preference: {
      set: async () => {
        throw new Error('disk full');
      },
    },
  });
  const result = await store.setLanguage('en');
  assert.deepEqual(result, { saved: false });
  assert.equal(store.getLanguage(), 'en');
  assert.match(section, /setSaveFailed\(!saved\)/);
  assert.match(section, /saveFailed \? \(/);
  assert.ok(es.settings.language.notSaved.length > 10 && en.settings.language.notSaved.length > 10);
});
