// AI-assisted: see docs/AI_LOG.md #70
// Static privacy check for the code added by tasks T-273 to T-276 (CA-007-16, RA-18, DT-8): no console.*
// call prints a token, uid or body; the availability body is only { available }; no Alert; no dependency
// beyond the allowed ones.
//   node scripts/tests/availabilityPrivacy.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/.*$/gm, '');

const NEW_FILES = [
  'backend/src/notifications/generator.js',
  'src/services/notifications/requestSource.js',
  'src/services/notifications/availabilityReporter.js',
  'src/hooks/useRequestSource.js',
];
// Files that also hold older code: only the availability parts are checked for the body and Alert rules.
const TOUCHED_FILES = [...NEW_FILES, 'backend/src/routes/notifications.js', 'src/services/notifications/notificationsApi.js'];

const SENSITIVE = /\b(token|uid|body|req\.body|payload|idToken|authorization|headers?)\b/i;

// 1. No console.* call in the new code prints token, uid or body (any console call with those names fails).
for (const file of TOUCHED_FILES) {
  const code = stripComments(read(file));
  const calls = code.match(/console\.\w+\s*\([^;]*\)/g) ?? [];
  for (const call of calls) {
    assert.ok(!SENSITIVE.test(call), `${file}: console call with sensitive data: ${call.slice(0, 60)}`);
  }
}
// The new client-side files do not log at all.
for (const file of NEW_FILES) {
  assert.ok(!/\bconsole\b/.test(stripComments(read(file))), `${file}: no console`);
}

// 2. The availability body is only { available }.
{
  const api = stripComments(read('src/services/notifications/notificationsApi.js'));
  const match = api.match(/post\('\/notifications\/availability',\s*(\w+)/);
  assert.ok(match, 'reportAvailability posts to /notifications/availability');
  const bodyDecl = api.match(new RegExp(`const ${match[1]}\\s*=([^;]*);`));
  assert.ok(bodyDecl, 'the body is built in one statement');
  const shapes = [...bodyDecl[1].matchAll(/\{[^}]*\}/g)].map((m) => m[0].replace(/\s/g, ''));
  assert.deepEqual(shapes, ['{available,seq}', '{available}'], 'the body is only { available } or { available, seq }');
  const reporter = stripComments(read('src/services/notifications/availabilityReporter.js'));
  const calls = reporter.match(/api\.reportAvailability\([^;]*;/g) ?? [];
  assert.ok(calls.length > 0);
  for (const call of calls) {
    assert.ok(/^api\.reportAvailability\((value|true|false),\s*nextSeq\(\)\)/.test(call), `reporter passes only a boolean and a seq: ${call}`);
  }
  assert.ok(!/(latitude|longitude|position|location|uid|email|phone)/i.test(reporter), 'reporter: no location or personal data');
  const hook = stripComments(read('src/hooks/useRequestSource.js'));
  assert.ok(!/(latitude|longitude|position|getLocationSource|uid)/i.test(hook), 'hook: no location or uid');
}

// 3. No Alert in the new code.
for (const file of NEW_FILES) {
  assert.ok(!/\bAlert\b/.test(stripComments(read(file))), `${file}: no Alert`);
}

// 4. No new dependencies: package.json dependencies are all allowed, and the new files import only
//    relative modules, react and react-native.
{
  const allowed = new Set([
    ...JSON.parse(read('scripts/dependencies.json')).allowed,
    ...(JSON.parse(read('scripts/dependencies.json')).proposed ?? []),
  ]);
  const pkg = JSON.parse(read('package.json'));
  for (const name of Object.keys(pkg.dependencies ?? {})) assert.ok(allowed.has(name), `package.json dependency not listed: ${name}`);
  for (const file of NEW_FILES) {
    const imports = [...read(file).matchAll(/(?:from|require\()\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const spec of imports) {
      assert.ok(spec.startsWith('.') || ['react', 'react-native'].includes(spec) || spec.startsWith('node:'), `${file}: unexpected import ${spec}`);
    }
  }
}

console.log('availabilityPrivacy: OK');
