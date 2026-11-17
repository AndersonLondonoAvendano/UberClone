// AI-assisted: see AI_LOG.md #67
// Tests for the live labels Proxy and the moved Spanish dictionary (T-244; CA-006-01 es part, CA-006-07).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/registerSrcLoader.mjs';

const snapshot = JSON.parse(readFileSync(new URL('./fixtures/labelsEsPaths.json', import.meta.url), 'utf8'));
const { labels, getSubmitErrorMessage } = await import('../../src/constants/labels.js');
const { es } = await import('../../src/i18n/dictionaries/es.js');
const { en } = await import('../../src/i18n/dictionaries/en/index.js');
const { createLiveLabels } = await import('../../src/i18n/liveLabels.js');
const store = await import('../../src/i18n/languageStore.js');

const read = (root, path) => path.split('.').reduce((node, key) => node[key], root);

test('live labels in es match the snapshot taken before the move', () => {
  assert.equal(store.getLanguage(), 'es');
  let checked = 0;
  for (const [path, entry] of Object.entries(snapshot)) {
    if (path.startsWith('#')) continue;
    const value = read(labels, path);
    if (entry.type === 'string') assert.equal(value, entry.value, path);
    else if (entry.type === 'array') {
      assert.equal(Array.isArray(value), true, path);
      assert.deepEqual(value, entry.value, path);
    } else if (entry.type === 'function') assert.equal(value(15), entry.sample, path);
    else assert.fail(`unexpected type at ${path}`);
    checked += 1;
  }
  assert.ok(checked > 500, `checked ${checked}`);
  assert.equal(getSubmitErrorMessage('permission-denied'), snapshot['#submitError(permission-denied)'].value);
  assert.equal(getSubmitErrorMessage('zzz'), snapshot['#submitError(zzz)'].value);
});

test('no path of the snapshot is lost and none is added (same keys at every node)', () => {
  const walkKeys = (live, plain, path) => {
    assert.deepEqual(Object.keys(live), Object.keys(plain), path || '(root)');
    for (const key of Object.keys(plain)) {
      const v = plain[key];
      if (v && typeof v === 'object' && !Array.isArray(v)) walkKeys(live[key], v, `${path}.${key}`);
    }
  };
  walkKeys(labels, es, '');
  assert.deepEqual(Object.keys(labels).length, 21);
});

test('object behaviour: in, keys, arrays, functions, strings, hyphenated keys, JSON', () => {
  assert.ok('trip' in labels);
  assert.ok(!('nope' in labels));
  assert.equal(Array.isArray(labels.history.weekdaysShort), true);
  assert.equal(labels.history.weekdaysShort.length, 7);
  assert.equal(labels.notifications.delayValue(15), '15 s');
  assert.equal(labels.registrationFlow.stepOf.replace('{n}', '2').replace('{total}', '3'), 'Paso 2 de 3');
  assert.equal(
    labels.registration.documents.submitErrors['permission-denied'],
    es.registration.documents.submitErrors['permission-denied'],
  );
  assert.equal(JSON.stringify(labels), JSON.stringify(es));
  assert.equal(labels.profile.errors.fullName, es.registration.personalData.fields.fullName.error);
  assert.equal(labels.profile.errors.fullName, labels.registration.personalData.fields.fullName.error);
  assert.equal(labels.auth, labels.auth, 'stable node identity');
  assert.equal(labels.nope, undefined);
  assert.equal(String(labels.nope?.x), 'undefined');
  assert.ok(typeof `${labels}` === 'string');
});

test('with en populated, labels in en return English text', () => {
  const live = createLiveLabels({ dictionaries: { es, en }, getLanguage: () => 'en' });
  assert.equal(live.trip.countdown.replace('{s}', '15'), en.trip.countdown.replace('{s}', '15'));
  assert.notEqual(live.trip.countdown, es.trip.countdown);
  assert.equal(live.profile.errors.fullName, en.profile.errors.fullName);
  assert.notEqual(live.profile.errors.fullName, es.profile.errors.fullName);
  assert.equal(live.notifications.delayValue(15), en.notifications.delayValue(15));
  assert.deepEqual(live.history.weekdaysShort, en.history.weekdaysShort);
});

test('a key missing in en falls back to es (injected dictionary)', () => {
  const partialEn = { trip: { countdown: en.trip.countdown } };
  const live = createLiveLabels({ dictionaries: { es, en: partialEn }, getLanguage: () => 'en' });
  assert.equal(live.trip.countdown, en.trip.countdown);
  assert.equal(live.trip.accept, es.trip.accept);
  assert.equal(live.appName, es.appName);
});

test('CA-006-07: per-language values through the real store and labels', async () => {
  const read = () => ({
    submit: getSubmitErrorMessage('permission-denied'),
    fullName: labels.profile.errors.fullName,
    countdown: labels.trip.countdown,
    delay: labels.notifications.delayValue(15),
  });
  await store.setLanguage('es');
  const spanish = read();
  await store.setLanguage('en');
  const english = read();
  await store.setLanguage('es');
  assert.equal(spanish.submit, es.registration.documents.submitErrors['permission-denied']);
  assert.equal(english.submit, en.registration.documents.submitErrors['permission-denied']);
  assert.notEqual(english.submit, spanish.submit);
  assert.notEqual(english.fullName, spanish.fullName);
  assert.notEqual(english.countdown, spanish.countdown);
  assert.equal(english.countdown.replace('{s}', '15'), 'Expires in 15 s');
  // delayValue(15) is "15 s" in both languages (an abbreviation shared by es and en), so it is not asserted as different.
  assert.equal(spanish.delay, '15 s');
  assert.equal(english.delay, '15 s');
});

test('switching language is seen by nodes captured earlier; missing keys fall back per key', () => {
  let lang = 'es';
  const dictionaries = {
    es: { a: { x: 'uno', y: 'dos', list: ['a', 'b'], fn: (n) => `${n} s` }, b: 'raiz' },
    en: { a: { x: 'one', list: ['c'], fn: (n) => `${n} sec` }, extra: 'only en' },
  };
  const live = createLiveLabels({ dictionaries, getLanguage: () => lang });
  const node = live.a;
  assert.equal(node.x, 'uno');
  lang = 'en';
  assert.equal(node.x, 'one');
  assert.equal(node.y, 'dos');
  assert.deepEqual(node.list, ['c']);
  assert.equal(node.fn(2), '2 sec');
  assert.equal(live.b, 'raiz');
  assert.deepEqual(Object.keys(live), ['a', 'b', 'extra']);
  assert.deepEqual(Object.keys(node), ['x', 'y', 'list', 'fn']);
  lang = 'xx';
  assert.equal(node.x, 'uno');
});

test('RI-05: texts follow the active language (CA-006-07 mechanism with an injected en)', () => {
  const dictionaries = {
    es: { n: { d: (s) => `${s} s` }, err: { p: 'permiso' } },
    en: { n: { d: (s) => `${s} sec` }, err: { p: 'permission' } },
  };
  let lang = 'es';
  const live = createLiveLabels({ dictionaries, getLanguage: () => lang });
  const before = [live.n.d(15), live.err.p];
  lang = 'en';
  assert.notDeepEqual([live.n.d(15), live.err.p], before);
});

test('real store drives the real labels', async () => {
  await store.setLanguage('en');
  assert.equal(labels.trip.accept, en.trip.accept);
  await store.setLanguage('es');
  assert.equal(labels.trip.accept, es.trip.accept);
});

test('labels are read-only through the Proxy', () => {
  assert.throws(() => {
    'use strict';
    labels.appName = 'x';
  });
  assert.equal(labels.appName, es.appName);
});
