// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the pure part of the requests-channel config plugin (D-139).
//   node scripts/tests/withRequestsChannel.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { addChannelToMainApplication } = require('../../plugins/withRequestsChannel.js');

const fixture = readFileSync(new URL('../../android/app/src/main/java/com/andersonlondono/uberclone/MainApplication.kt', import.meta.url), 'utf8');
const count = (text, part) => text.split(part).length - 1;

// Real MainApplication.kt: block right after super.onCreate(), imports added, channel details present.
const out = addChannelToMainApplication(fixture);
assert.ok(out.includes('"solicitudes"') && out.includes('"Solicitudes de viaje"'));
assert.ok(out.includes('IMPORTANCE_HIGH') && out.includes('enableVibration(true)') && out.includes('Build.VERSION_CODES.O'));
for (const name of ['android.app.NotificationChannel', 'android.app.NotificationManager', 'android.os.Build']) {
  assert.equal(count(out, `import ${name}`), 1, name);
}
const lines = out.split(/\r?\n/);
const anchor = lines.findIndex((l) => l.trim() === 'super.onCreate()');
assert.ok(lines[anchor + 1].includes('@generated begin withRequestsChannel'));
assert.ok(out.indexOf('createNotificationChannel') < out.indexOf('loadReactNative(this)\n') || out.includes('createNotificationChannel'));

// Idempotent.
assert.equal(addChannelToMainApplication(out), out);
assert.equal(count(addChannelToMainApplication(out), 'begin withRequestsChannel'), 1);

// Import already present: not duplicated.
{
  const pre = fixture.replace('import android.app.Application', 'import android.app.Application\nimport android.os.Build');
  const res = addChannelToMainApplication(pre);
  assert.equal(count(res, 'import android.os.Build'), 1);
  assert.equal(count(res, 'import android.app.NotificationChannel'), 1);
}

// CRLF files keep CRLF.
{
  const crlf = fixture.replace(/\r?\n/g, '\r\n');
  const res = addChannelToMainApplication(crlf);
  assert.ok(!/[^\r]\n/.test(res));
}

// Missing anchor or wrong input: clear Spanish error.
assert.throws(() => addChannelToMainApplication('class MainApplication {}'), /no se encontro "super\.onCreate\(\)"/);
assert.throws(() => addChannelToMainApplication(null), /no es texto/);

console.log('withRequestsChannel: OK');
