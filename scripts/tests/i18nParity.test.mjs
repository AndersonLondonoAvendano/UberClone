// AI-assisted: see docs/AI_LOG.md #67
// es/en dictionary parity (T-250; CA-006-01, 02, 03, 07).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { es } = await import('../../src/i18n/dictionaries/es.js');
const { en } = await import('../../src/i18n/dictionaries/en/index.js');

const isNode = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const kind = (v) => (typeof v === 'function' ? 'function' : Array.isArray(v) ? 'array' : typeof v);

// Leaf paths: strings, arrays and functions (array elements are checked separately).
function leaves(root, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(root)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isNode(value)) leaves(value, path, out);
    else out.set(path, value);
  }
  return out;
}

const params = (text) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
const esLeaves = leaves(es);
const enLeaves = leaves(en);

test('CA-006-01: same leaf paths in es and en, same kind per path', () => {
  const missingInEn = [...esLeaves.keys()].filter((p) => !enLeaves.has(p));
  const extraInEn = [...enLeaves.keys()].filter((p) => !esLeaves.has(p));
  assert.deepEqual(missingInEn, [], `missing in en: ${missingInEn.join(', ')}`);
  assert.deepEqual(extraInEn, [], `only in en: ${extraInEn.join(', ')}`);
  const kindDiff = [...esLeaves].filter(([p, v]) => kind(v) !== kind(enLeaves.get(p))).map(([p]) => p);
  assert.deepEqual(kindDiff, [], `kind differs: ${kindDiff.join(', ')}`);
  console.log(`# leaf paths: es=${esLeaves.size} en=${enLeaves.size}`);
});

test('CA-006-02: no empty or blank text, same {param} names per pair', () => {
  const problems = [];
  for (const [path, esValue] of esLeaves) {
    const enValue = enLeaves.get(path);
    if (enValue === undefined) continue;
    const pairs = [];
    if (typeof esValue === 'string') pairs.push([path, esValue, enValue]);
    else if (Array.isArray(esValue)) {
      if (esValue.length !== enValue.length) problems.push(`${path}: length ${esValue.length} vs ${enValue.length}`);
      esValue.forEach((item, i) => pairs.push([`${path}[${i}]`, item, enValue[i]]));
    } else if (typeof esValue === 'function') {
      if (esValue.length !== enValue.length) problems.push(`${path}: arity ${esValue.length} vs ${enValue.length}`);
      for (const sample of [15, 1, 'x']) {
        const a = esValue(sample);
        const b = enValue(sample);
        if (typeof a !== 'string' || typeof b !== 'string') problems.push(`${path}: non-string result`);
        else if (!a.trim() || !b.trim()) problems.push(`${path}(${sample}): blank result`);
      }
    }
    for (const [p, a, b] of pairs) {
      if (typeof a !== 'string' || typeof b !== 'string') {
        problems.push(`${p}: not a string pair`);
        continue;
      }
      if (!a.trim()) problems.push(`${p}: empty in es`);
      if (!b.trim()) problems.push(`${p}: empty in en`);
      if (params(a).join() !== params(b).join()) problems.push(`${p}: params {${params(a)}} vs {${params(b)}}`);
    }
  }
  assert.deepEqual(problems, []);
});

test('CA-006-03: weekdaysShort has 7 non-empty items in each language', () => {
  for (const [name, dict] of [['es', es], ['en', en]]) {
    const days = dict.history.weekdaysShort;
    assert.equal(Array.isArray(days), true, name);
    assert.equal(days.length, 7, name);
    for (const d of days) assert.ok(typeof d === 'string' && d.trim(), name);
  }
});
