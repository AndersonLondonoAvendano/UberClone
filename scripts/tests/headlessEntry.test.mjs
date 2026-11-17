// AI-assisted: see docs/AI_LOG.md #64
// Static guard for the headless-safe entry (D-145). Run: node --test scripts/tests/headlessEntry.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const ENTRY_ALLOWED = new Set(['react-native', './src/services/notifications/backgroundHandler']);
const HANDLER_ALLOWED = new Set(['react-native', '@react-native-firebase/messaging']);

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// Specifiers evaluated eagerly: static imports and require() calls at column 0 (top level).
export function eagerSpecifiers(source) {
  const text = stripComments(source);
  const found = [];
  for (const m of text.matchAll(/^import\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/gm)) found.push(m[1]);
  for (const m of text.matchAll(/^(?:(?:const|let|var)\s[^=]*=\s*)?require\(\s*['"]([^'"]+)['"]\s*\)/gm)) found.push(m[1]);
  return found;
}

// Specifiers that load when a function runs (indented require): allowed only for the handler SDK.
export function lazySpecifiers(source) {
  const text = stripComments(source);
  return [...text.matchAll(/^[ \t]+.*\brequire\(\s*['"]([^'"]+)['"]\s*\)/gm)].map((m) => m[1]);
}

export function entryViolations(source) {
  return eagerSpecifiers(source).filter((s) => !ENTRY_ALLOWED.has(s));
}

export function handlerViolations(source) {
  return [...eagerSpecifiers(source), ...lazySpecifiers(source)].filter((s) => !HANDLER_ALLOWED.has(s));
}

const entry = readFileSync(new URL('../../index.js', import.meta.url), 'utf8');
const handler = readFileSync(
  new URL('../../src/services/notifications/backgroundHandler.js', import.meta.url),
  'utf8',
);

test('index.js evaluates only the allowed modules eagerly', () => {
  assert.deepEqual(entryViolations(entry), []);
});

test('index.js loads App and expo only lazily (indented require)', () => {
  assert.ok(lazySpecifiers(entry).includes('./App'));
  assert.ok(lazySpecifiers(entry).includes('expo'));
});

test('the background handler module stays within the allowed list', () => {
  assert.deepEqual(handlerViolations(handler), []);
});

test('negative: an eager import of App, expo or expo-* is detected', () => {
  assert.deepEqual(entryViolations("import App from './App';\nimport { x } from 'expo';"), ['./App', 'expo']);
  assert.deepEqual(entryViolations("import 'expo-asset';"), ['expo-asset']);
  assert.deepEqual(entryViolations("const { registerRootComponent } = require('expo');"), ['expo']);
});

test('negative: a handler importing app modules is detected', () => {
  assert.deepEqual(handlerViolations("import { x } from '../session/store';"), ['../session/store']);
  assert.deepEqual(handlerViolations("function f() {\n  require('expo-secure-store');\n}"), ['expo-secure-store']);
});
