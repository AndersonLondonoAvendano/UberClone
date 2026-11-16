// AI-assisted: see docs/AI_LOG.md #64
// Guards against "ReferenceError: Property 'X' doesn't exist" in the notifications path (D-147):
// (a) a static check that no file uses an undeclared free identifier, (b) the dev-trace route run
// with injected dependencies. Parser: @babel/parser + @babel/traverse (already in node_modules).
//   node --test scripts/tests/notificationsFreeSymbols.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const require = createRequire(import.meta.url);
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ROOT = path.resolve(import.meta.dirname, '../..');
const KNOWN_GLOBALS = new Set([
  '__DEV__', 'require', 'module', 'exports', 'console', 'process', 'globalThis', 'undefined', 'NaN', 'Infinity',
  'Promise', 'Date', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Error', 'TypeError',
  'Map', 'Set', 'WeakMap', 'Symbol', 'RegExp', 'parseInt', 'parseFloat', 'isNaN', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'fetch', 'AbortController', 'URL', 'Intl', 'Number', 'encodeURIComponent',
]);

function listJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJs(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

function freeIdentifiers(file) {
  const ast = parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  const free = new Set();
  traverse(ast, {
    Program(programPath) {
      for (const name of Object.keys(programPath.scope.globals)) free.add(name);
    },
  });
  return [...free].filter((name) => !KNOWN_GLOBALS.has(name));
}

const FILES = [
  ...listJs(path.join(ROOT, 'src/services/notifications')),
  path.join(ROOT, 'src/components/NotificationsBridge.js'),
  path.join(ROOT, 'src/components/settings/NotificationsSection.js'),
  path.join(ROOT, 'index.js'),
];

test('no notifications file uses an undeclared identifier', () => {
  for (const file of FILES) {
    assert.deepEqual(freeIdentifiers(file), [], `free identifiers in ${path.relative(ROOT, file)}`);
  }
});

test('every use of the safeLog helpers has an import or a definition', () => {
  for (const file of FILES) {
    const text = fs.readFileSync(file, 'utf8');
    for (const name of ['logPushEvent', 'logTokenInDev', 'maskToken']) {
      const uses = new RegExp(String.raw`\b${name}\s*\(`).test(text);
      const declared = new RegExp(String.raw`import[^;]*\b${name}\b[^;]*from|function ${name}\b`).test(text);
      if (uses) assert.ok(declared, `${name} used without import in ${path.relative(ROOT, file)}`);
    }
  }
});

test('the checker detects an undeclared identifier (self-check)', () => {
  const tmp = path.join(import.meta.dirname, 'helpers', '__free_probe.js');
  fs.writeFileSync(tmp, 'export const f = () => logPushEvent("x");\n');
  try {
    assert.deepEqual(freeIdentifiers(tmp), ['logPushEvent']);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
});

test('onNotificationOpened trace route runs without ReferenceError and respects isDev', async () => {
  const { createNotifications } = await import('../../src/services/notifications/index.js');
  const { createFakeAdapter } = await import('../../src/services/notifications/adapters/fakeAdapter.js');
  const { createPendingIntent } = await import('../../src/services/notifications/pendingIntent.js');
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  for (const isDev of [true, false]) {
    for (const initial of [null, { type: 'bad' }]) {
      const logs = [];
      const notifications = createNotifications(createFakeAdapter({ initial }), {
        intents: createPendingIntent(), isDev, log: (message) => logs.push(message),
      });
      const cancel = notifications.onNotificationOpened(() => {});
      await tick();
      cancel();
      if (isDev) assert.ok(logs.some((line) => line.startsWith('[push] push-initial-')), 'expected an initial trace');
      else assert.deepEqual(logs, []);
    }
  }
});
