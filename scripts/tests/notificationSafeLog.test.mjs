// AI-assisted: see AI_LOG.md #64
// Tests for the safe token log (maskToken, logTokenInDev). Run: node --test scripts/tests/notificationSafeLog.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import './helpers/registerSrcLoader.mjs';

const { maskToken, logTokenInDev } = await import('../../src/services/notifications/safeLog.js');

const LONG_TOKEN = 'abcd1234'.padEnd(163, 'x');

test('maskToken shows the first 8 characters and the length', () => {
  assert.equal(maskToken(LONG_TOKEN), 'abcd1234… (len 163)');
});

test('maskToken never contains the full token', () => {
  assert.ok(!maskToken(LONG_TOKEN).includes(LONG_TOKEN));
  for (const short of ['a', 'ab', 'abcdefgh', 'abcdefghi']) {
    const masked = maskToken(short);
    assert.ok(!masked.includes(short), `leaked ${short}: ${masked}`);
  }
});

test('maskToken is tolerant to null, undefined, empty and non-string input', () => {
  for (const value of [null, undefined, '', 42, {}, ['a']]) {
    assert.equal(maskToken(value), '(no token)');
  }
});

test('logTokenInDev writes only the masked token when isDev is true', () => {
  const lines = [];
  logTokenInDev('token', LONG_TOKEN, { isDev: true, log: (line) => lines.push(line) });
  assert.deepEqual(lines, ['token: abcd1234… (len 163)']);
});

test('logTokenInDev does not write when isDev is false or missing', () => {
  const lines = [];
  const log = (line) => lines.push(line);
  logTokenInDev('token', LONG_TOKEN, { isDev: false, log });
  logTokenInDev('token', LONG_TOKEN, { log });
  logTokenInDev('token', LONG_TOKEN);
  assert.equal(lines.length, 0);
});
