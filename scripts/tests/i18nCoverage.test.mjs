// AI-assisted: see docs/AI_LOG.md #67
// Static coverage test for the language feature (T-256; D-192; CA-006-22 to 26).
// Regex heuristic: it does not understand all JSX and can miss text built dynamically; the English
// visual review (T-263, T-264) is still needed. Directories listed in fixtures/i18nPending.json are not
// migrated yet: they must still have findings (otherwise remove them) and every other directory must have none.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './helpers/registerSrcLoader.mjs';

const { es } = await import('../../src/i18n/dictionaries/es.js');

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, '../../src');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(here, 'fixtures', name), 'utf8'));

// Directories where the hook and the module-level rules apply (D-192 rules 1 and 2).
const UI_UNITS = /^(screens|components|navigation|context|hooks)(\/|$)/;
const LABELS_SHIM = 'constants/labels.js';
const PROP_NAMES = 'accessibilityLabel|accessibilityHint|placeholder|title|label';
const KEY_NAMES = `${PROP_NAMES}|message|subtitle|description|hint|body|text`;
const hasLetter = (s) => /\p{L}/u.test(s);

// Replaces comments with spaces (same length), leaving string and template contents untouched.
export function stripComments(source) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < source.length) {
    const c = source[i];
    const n = source[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') {
        out += n ?? '';
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
    } else if (c === '/' && n === '/') {
      while (i < source.length && source[i] !== '\n') {
        out += ' ';
        i += 1;
      }
    } else if (c === '/' && n === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      out += source.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
    } else {
      if (c === '"' || c === "'" || c === '`') quote = c;
      out += c;
      i += 1;
    }
  }
  return out;
}

const isJsxFile = (code) => /<[A-Z][A-Za-z.]*[\s>/]|<\/|\/>/.test(code);

// Matching closing paren for the one at `open`, ignoring quotes.
function callBody(code, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < code.length; i += 1) {
    const c = code[i];
    if (quote) {
      if (c === '\\') i += 1;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '(') depth += 1;
    else if (c === ')') {
      depth -= 1;
      if (depth === 0) return code.slice(open, i + 1);
    }
  }
  return code.slice(open);
}

// Findings of rule 3 and the Alert/notification rule: [{ rule: 'text', text }].
export function findLooseText(source, { jsx = isJsxFile(stripComments(source)) } = {}) {
  const code = stripComments(source);
  const found = [];
  // Interpolations are code, not text; JS keywords and hex colors are not text either.
  const add = (text, { strict = false } = {}) => {
    const t = text.replace(/\s+/g, ' ').trim();
    const visible = t.replace(/\$\{[^}]*\}/g, '');
    if (!t || !hasLetter(visible) || /^#[0-9a-f]{3,8}$/i.test(t) || /^(return|else|if|const|let|var)\b/.test(t)) return;
    if (strict && !/\s|^[A-ZÁÉÍÓÚ¿¡]|[áéíóúñ¿¡]/.test(visible)) return;
    found.push(t);
  };
  // JSX text between a tag end (or an expression end) and the next tag.
  if (jsx) {
    for (const m of code.matchAll(/(?<![=-])>([^<>{}();=]+)</g)) add(m[1]);
    for (const m of code.matchAll(/\}([^<>{}();=&|]+)</g)) add(m[1]);
  }
  // Props with a literal value: title="x", title={'x'}.
  for (const m of code.matchAll(new RegExp(`\\b(?:${PROP_NAMES})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*(['"\`])((?:(?!\\3).)*)\\3\\s*\\})`, 'g'))) {
    add(m[1] ?? m[2] ?? m[4] ?? '');
  }
  // Object entries with a literal value: label: 'x'.
  for (const m of code.matchAll(new RegExp(`\\b(?:${KEY_NAMES})\\s*:\\s*(?:"([^"]*)"|'([^']*)'|\`([^\`$]*)\`)`, 'g'))) {
    add(m[1] ?? m[2] ?? m[3] ?? '', { strict: true });
  }
  // Dialogs and local notifications must not carry literal text (CA-006-25, 26).
  for (const m of code.matchAll(/\b(?:Alert\.alert|scheduleNotificationAsync)\s*\(/g)) {
    const body = callBody(code, m.index + m[0].length - 1);
    for (const s of body.matchAll(/"([^"]*)"|'([^']*)'|`([^`$]*)`/g)) {
      const value = s[1] ?? s[2] ?? s[3] ?? '';
      if (/\s|^[A-ZÁÉÍÓÚ¿¡]/.test(value) && hasLetter(value)) add(value);
    }
  }
  return found;
}

// Rule 1: a file with JSX that reads labels must call useLanguage().
export function missingHook(source) {
  const code = stripComments(source);
  const readsLabels = /import\s*\{[^}]*\blabels\b[^}]*\}\s*from/.test(code);
  const rendersUi = isJsxFile(code) || /\boptions\s*[:=]/.test(code);
  return readsLabels && rendersUi && !/\buseLanguage\s*\(/.test(code);
}

// Rule 2: a module-level statement that reads a leaf (string, array, function) of labels freezes the language.
export function moduleLevelLeafReads(source, dictionary = es) {
  const code = stripComments(source);
  const statements = code.split(/\n(?=[A-Za-z@])/);
  const leaves = [];
  for (const statement of statements) {
    if (!/^(?:export\s+)?(?:const|let|var)\s/.test(statement)) continue;
    if (/=>|\bfunction\b/.test(statement)) continue;
    for (const m of statement.matchAll(/\blabels((?:\.[A-Za-z_$][\w$]*)+)/g)) {
      let node = dictionary;
      for (const key of m[1].slice(1).split('.')) node = node?.[key];
      if (node !== undefined && (node === null || typeof node !== 'object' || Array.isArray(node))) leaves.push(`labels${m[1]}`);
    }
  }
  return leaves;
}

// Rule 4: `labels` is defined only under src/i18n (the live view in constants/labels.js is the one shim).
export function definesLabels(source) {
  return /\b(?:const|let|var)\s+labels\s*=/.test(stripComments(source));
}

// Unit = pending key: screens/<sub> or the first folder under src.
export function unitOf(rel) {
  const parts = rel.split('/');
  return parts[0] === 'screens' && parts.length > 2 ? `screens/${parts[1]}` : parts[0];
}

function walk(dir, base = dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full, base));
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return files;
}

// Scans { rel: source } and returns findings [{ unit, file, rule, text }].
export function scan(files) {
  const findings = [];
  for (const [rel, source] of Object.entries(files)) {
    if (rel.startsWith('i18n/')) continue;
    const unit = unitOf(rel);
    const push = (rule, text) => findings.push({ unit, file: rel, rule, text });
    for (const text of findLooseText(source)) push('text', text);
    if (UI_UNITS.test(rel)) {
      if (missingHook(source)) push('hook', 'useLanguage');
      for (const leaf of moduleLevelLeafReads(source)) push('module', leaf);
    }
    if (rel !== LABELS_SHIM && definesLabels(source)) push('define', 'labels');
  }
  return findings;
}

// Checks findings against exceptions and pending units; returns a list of problem strings.
export function evaluate({ findings, exceptions, pending, files }) {
  const problems = [];
  const used = new Set();
  const seen = new Set();
  exceptions.forEach((e, index) => {
    const key = `${e.rule}|${e.file}|${e.text}`;
    if (!e.file || !e.reason || !e.rule || !e.text) problems.push(`exception #${index} needs rule, file, text and reason`);
    else if (/[*?]/.test(e.file) || !/\.(js|jsx|ts|tsx)$/.test(e.file)) problems.push(`exception #${index}: file must be an exact file, no wildcards (${e.file})`);
    else if (!(e.file in files)) problems.push(`exception #${index}: file does not exist (${e.file})`);
    else if (seen.has(key)) problems.push(`exception #${index} is duplicated (${key})`);
    seen.add(key);
  });
  const remaining = findings.filter((f) => {
    const index = exceptions.findIndex((e) => e.rule === f.rule && e.file === f.file && e.text === f.text);
    if (index === -1) return true;
    used.add(index);
    return false;
  });
  exceptions.forEach((e, index) => {
    if (!used.has(index)) problems.push(`stale exception, matches nothing: ${e.rule} ${e.file} "${e.text}"`);
  });
  const units = new Set(Object.keys(files).filter((r) => !r.startsWith('i18n/')).map(unitOf));
  for (const p of pending) if (!units.has(p)) problems.push(`pending unit does not exist: ${p}`);
  const byUnit = new Map();
  for (const f of remaining) byUnit.set(f.unit, (byUnit.get(f.unit) ?? 0) + 1);
  for (const p of pending) {
    if (units.has(p) && !byUnit.has(p)) problems.push(`pending unit is already clean, remove it from i18nPending.json: ${p}`);
  }
  for (const f of remaining) {
    if (!pending.includes(f.unit)) problems.push(`${f.unit}: ${f.file}: ${f.rule} "${f.text}"`);
  }
  return problems;
}

// ---- Self-checks: a good fake file, bad fake files and the way the evaluator fails.
const GOOD = `import { labels } from '../constants/labels';
import { useLanguage } from '../i18n/useLanguage';
export function Card({ n }) {
  useLanguage();
  return (<View><Text accessibilityLabel={labels.a.b}>{labels.a.b}</Text><Text>{n}</Text><Text>{'·'}</Text></View>);
}`;

test('self-check: a good file has no findings', () => {
  assert.deepEqual(findLooseText(GOOD), []);
  assert.equal(missingHook(GOOD), false);
  assert.deepEqual(scan({ 'components/Card.js': GOOD }), []);
});

test('self-check: bad files are caught', () => {
  assert.deepEqual(findLooseText('const A = () => <Text>Hola mundo</Text>;'), ['Hola mundo']);
  assert.deepEqual(findLooseText('const A = () => <Text>{n} km</Text>;'), ['km']);
  assert.deepEqual(findLooseText('const A = () => <Input placeholder="Correo" />;'), ['Correo']);
  assert.deepEqual(findLooseText("const A = () => <Btn accessibilityHint={'Toca aquí'} />;"), ['Toca aquí']);
  assert.deepEqual(findLooseText("const A = () => <Btn title='Guardar' />;"), ['Guardar']);
  assert.deepEqual(findLooseText("const items = [{ label: 'Todos' }];"), ['Todos']);
  assert.deepEqual(findLooseText("Alert.alert('Error', 'No se pudo guardar');"), ['Error', 'No se pudo guardar']);
  assert.deepEqual(findLooseText('Alert.alert(labels.a.title, labels.a.body);'), []);
  assert.deepEqual(findLooseText("Notifications.scheduleNotificationAsync({ content: { title: 'Aviso', body: 'Hola ya' } });").length > 0, true);
  assert.deepEqual(findLooseText('// <Text>Hola mundo</Text>\nconst a = 1;'), []);
  assert.equal(missingHook(GOOD.replace('useLanguage();', '')), true);
  assert.deepEqual(moduleLevelLeafReads("const X = labels.states.loading.title;\nconst Y = labels.states.loading;\nconst f = () => labels.states.loading.title;", { states: { loading: { title: 'a' } } }), ['labels.states.loading.title']);
  assert.equal(definesLabels('export const labels = {};'), true);
  assert.equal(definesLabels('const x = labels.a;'), false);
});

test('self-check: the evaluator fails as expected', () => {
  const files = { 'components/A.js': '', 'utils/b.js': '' };
  const dirty = { unit: 'components', file: 'components/A.js', rule: 'text', text: 'Hola' };
  const ok = (o) => evaluate({ findings: [], exceptions: [], pending: [], files, ...o });
  assert.deepEqual(ok({}), []);
  assert.equal(ok({ findings: [dirty] }).length, 1, 'dirty non-pending unit fails');
  assert.deepEqual(ok({ findings: [dirty], pending: ['components'] }), [], 'dirty pending unit passes');
  assert.equal(ok({ pending: ['components'] }).length, 1, 'clean pending unit fails');
  assert.equal(ok({ pending: ['nowhere'] }).length, 1, 'unknown pending unit fails');
  const exception = { rule: 'text', file: 'components/A.js', text: 'Hola', reason: 'test' };
  assert.deepEqual(ok({ findings: [dirty], exceptions: [exception] }), [], 'exception covers a finding');
  assert.equal(ok({ exceptions: [exception] }).length, 1, 'stale exception fails');
  assert.equal(ok({ findings: [dirty], exceptions: [{ ...exception, file: 'components/*.js' }] }).length > 0, true, 'wildcard fails');
  assert.equal(ok({ findings: [dirty], exceptions: [{ ...exception, reason: '' }] }).length > 0, true, 'no reason fails');
});

// ---- The real source tree.
const files = Object.fromEntries(walk(SRC).map((rel) => [rel, fs.readFileSync(path.join(SRC, rel), 'utf8')]));
const exceptions = readJson('i18nExceptions.json');
const pending = readJson('i18nPending.json');
const findings = scan(files);

test('CA-006-22 to 26: no loose text outside pending units and exceptions', () => {
  const problems = evaluate({ findings, exceptions, pending, files });
  assert.deepEqual(problems, []);
});

test('CA-006-26: no local notification or Alert.alert carries literal text', () => {
  const calls = findings.filter((f) => f.rule === 'text' && /Alert|schedule/.test(files[f.file]));
  assert.ok(Array.isArray(calls));
  for (const [rel, source] of Object.entries(files)) {
    if (rel.startsWith('i18n/')) continue;
    for (const m of stripComments(source).matchAll(/\b(?:Alert\.alert|scheduleNotificationAsync)\s*\(/g)) {
      assert.deepEqual(findLooseText(callBody(stripComments(source), m.index + m[0].length - 1), { jsx: false }), [], rel);
    }
  }
});

test('report: files reviewed per unit and findings per pending unit', { skip: !process.env.I18N_REPORT }, () => {
  const reviewed = {};
  for (const rel of Object.keys(files)) if (!rel.startsWith('i18n/')) reviewed[unitOf(rel)] = (reviewed[unitOf(rel)] ?? 0) + 1;
  const counts = {};
  for (const f of findings) counts[f.unit] = (counts[f.unit] ?? 0) + 1;
  console.log(JSON.stringify({ reviewed, findings: counts }, null, 1));
  if (process.env.I18N_REPORT === 'dump') console.log(findings.map((f) => `${f.file} [${f.rule}] ${f.text}`).join('\n'));
});
