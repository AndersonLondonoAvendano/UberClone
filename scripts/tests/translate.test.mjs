// AI-assisted: see AI_LOG.md #67
// Tests for t() with injected dictionaries (T-245; CA-006-04, 05, 06). The real trip.countdown case waits for T-246.
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createTranslator, t } = await import('../../src/i18n/translate.js');

const dictionaries = {
  es: {
    trip: { countdown: 'Vence en {s} s', only: 'Solo es', greet: 'Hola {name}, {name}!' },
    days: { other: '{n} días', one: '{n} día' },
    list: ['a'],
  },
  en: {
    trip: { countdown: 'Expires in {s} s', greet: 'Hi {name}' },
    days: { one: '{n} day', other: '{n} days' },
  },
};
let lang = 'es';
const warnings = [];
const tt = createTranslator({ dictionaries, getLanguage: () => lang, warn: (m) => warnings.push(m) });

test('substitutes named params in both languages (CA-006-04)', () => {
  assert.equal(tt('trip.countdown', { s: 7 }), 'Vence en 7 s');
  assert.equal(tt('trip.countdown', { s: 7 }, 'en'), 'Expires in 7 s');
  lang = 'en';
  assert.equal(tt('trip.countdown', { s: 0 }), 'Expires in 0 s');
  assert.equal(tt('trip.greet', { name: 'Ana' }), 'Hi Ana');
  lang = 'es';
  assert.equal(tt('trip.greet', { name: 'Ana' }), 'Hola Ana, Ana!');
});

test('a missing param becomes an empty string and warns (CA-006-04)', () => {
  warnings.length = 0;
  for (const params of [undefined, {}, { s: null }, { s: undefined }]) {
    const text = tt('trip.countdown', params);
    assert.equal(text, 'Vence en  s');
    assert.ok(!text.includes('{'));
  }
  assert.equal(warnings.length, 4);
});

test('plurals: one for n = 1, other for 0, 2, 10 (CA-006-05)', () => {
  for (const language of ['es', 'en']) {
    const word = language === 'es' ? ['día', 'días'] : ['day', 'days'];
    assert.equal(tt('days', { n: 1 }, language), `1 ${word[0]}`);
    for (const n of [0, 2, 10]) assert.equal(tt('days', { n }, language), `${n} ${word[1]}`);
  }
  assert.equal(tt('days', undefined, 'en'), ' days');
});

test('a key only in es falls back to Spanish; a unknown key returns the key (CA-006-06)', () => {
  warnings.length = 0;
  assert.equal(tt('trip.only', undefined, 'en'), 'Solo es');
  assert.equal(tt('no.such.key', undefined, 'en'), 'no.such.key');
  assert.equal(tt('no.such.key'), 'no.such.key');
  assert.equal(warnings.length, 2);
});

test('never throws and never returns undefined', () => {
  for (const key of [undefined, null, '', 'trip', 'list', 'trip.countdown.x', 5, '__proto__', 'constructor']) {
    const out = tt(key, { s: 1 }, 'en');
    assert.equal(typeof out, 'string', String(key));
  }
  assert.equal(tt('trip.countdown', { s: 1 }, 'xx'), 'Vence en 1 s');
  assert.equal(tt('trip.countdown', null), 'Vence en  s');
  const broken = createTranslator({ dictionaries: null, getLanguage: () => 'es', warn: () => {} });
  assert.equal(broken('a.b'), 'a.b');
});

test('the real t works with the real (empty en) dictionaries', () => {
  assert.equal(t('appName'), 'UberClone Conductor');
  assert.equal(t('appName', undefined, 'en'), 'UberClone Conductor');
  assert.equal(t('registrationFlow.stepOf', { n: 1, total: 3 }), 'Paso 1 de 3');
});
