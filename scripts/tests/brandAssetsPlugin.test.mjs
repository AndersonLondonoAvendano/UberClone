import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const plugin = require('../../plugins/withBrandAssets.js');

test('FCM default icon and color are added to the manifest, idempotently', () => {
  const manifest = { manifest: { $: {}, application: [{ 'meta-data': [] }] } };
  plugin.addFcmDefaults(manifest);
  plugin.addFcmDefaults(manifest);
  const list = manifest.manifest.application[0]['meta-data'];
  assert.equal(list.length, 2);
  assert.ok(list.some((m) => m.$['android:resource'] === '@drawable/notification_icon'));
  assert.ok(list.some((m) => m.$['android:resource'] === '@color/notification_color'));
});

test('brand color goes to colors and the splash style', () => {
  const colors = plugin.addColors({ resources: { color: [{ $: { name: 'splashscreen_background' }, _: '#FFFFFF' }] } });
  assert.equal(colors.resources.color.find((c) => c.$.name === 'splashscreen_background')._, '#009688');
  assert.equal(colors.resources.color.find((c) => c.$.name === 'notification_color')._, '#009688');
  const styles = plugin.addSplashStyle({ resources: { style: [{ $: { name: 'Theme.App.SplashScreen' }, item: [] }] } });
  assert.ok(styles.resources.style[0].item.some((i) => i.$.name === 'android:windowBackground' && i._ === '@drawable/splash_background'));
  assert.throws(() => plugin.addSplashStyle({ resources: { style: [] } }));
});
