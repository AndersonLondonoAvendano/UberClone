// Expo config plugin: brand assets that Expo does not wire by itself (no expo-splash-screen installed).
//  1. FCM small icon: copies assets/notification-icon.png to res/drawable-xxxhdpi/notification_icon.png and
//     sets the manifest defaults com.google.firebase.messaging.default_notification_icon / _color.
//  2. Splash: copies assets/splash-icon.png as splashscreen_logo, paints the window with the brand color and
//     centers the logo (layer-list), also for the Android 12+ system splash.
// Runs during prebuild; android/ is never edited by hand. Idempotent.
const fs = require('node:fs');
const path = require('node:path');
const {
  withAndroidManifest,
  withAndroidColors,
  withAndroidStyles,
  withDangerousMod,
} = require('expo/config-plugins');

const BRAND_COLOR = '#009688';
const ICON_META = 'com.google.firebase.messaging.default_notification_icon';
const COLOR_META = 'com.google.firebase.messaging.default_notification_color';
const SPLASH_STYLE = 'Theme.App.SplashScreen';
const DENSITIES = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];

function upsertMetaData(application, name, resource) {
  const list = (application['meta-data'] = application['meta-data'] || []);
  const item = { $: { 'android:name': name, 'android:resource': resource, 'tools:replace': 'android:resource' } };
  const index = list.findIndex((entry) => entry.$ && entry.$['android:name'] === name);
  if (index === -1) list.push(item);
  else list[index] = item;
}

// Pure: manifest JSON in, manifest JSON out.
function addFcmDefaults(manifest) {
  manifest.manifest.$['xmlns:tools'] = manifest.manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';
  const application = manifest.manifest.application && manifest.manifest.application[0];
  if (!application) throw new Error('withBrandAssets: AndroidManifest sin <application>.');
  upsertMetaData(application, ICON_META, '@drawable/notification_icon');
  upsertMetaData(application, COLOR_META, '@color/notification_color');
  return manifest;
}

function setItem(resources, tag, name, value) {
  const list = (resources.resources[tag] = resources.resources[tag] || []);
  const index = list.findIndex((entry) => entry.$ && entry.$.name === name);
  const item = { $: { name }, _: value };
  if (index === -1) list.push(item);
  else list[index] = item;
}

// Pure: colors.xml JSON in/out.
function addColors(colors) {
  setItem(colors, 'color', 'notification_color', BRAND_COLOR);
  setItem(colors, 'color', 'splashscreen_background', BRAND_COLOR);
  return colors;
}

// Pure: styles.xml JSON in/out. Fails loudly if the splash theme is missing.
function addSplashStyle(styles) {
  const style = (styles.resources.style || []).find((entry) => entry.$ && entry.$.name === SPLASH_STYLE);
  if (!style) throw new Error(`withBrandAssets: no existe el estilo ${SPLASH_STYLE}; la plantilla cambio.`);
  const items = (style.item = style.item || []);
  const put = (name, value) => {
    const index = items.findIndex((entry) => entry.$ && entry.$.name === name);
    const item = { $: { name }, _: value };
    if (index === -1) items.push(item);
    else items[index] = item;
  };
  put('android:windowBackground', '@drawable/splash_background');
  put('android:windowSplashScreenBackground', '@color/splashscreen_background');
  put('android:windowSplashScreenAnimatedIcon', '@drawable/splashscreen_logo');
  return styles;
}

const SPLASH_LAYER = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splashscreen_background"/>
  <item>
    <bitmap android:gravity="center" android:src="@drawable/splashscreen_logo"/>
  </item>
</layer-list>
`;

function copyAsset(root, from, to) {
  const source = path.join(root, 'assets', from);
  if (!fs.existsSync(source)) throw new Error(`withBrandAssets: falta assets/${from}.`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(source, to);
}

function withBrandAssets(config) {
  config = withAndroidManifest(config, (c) => {
    c.modResults = addFcmDefaults(c.modResults);
    return c;
  });
  config = withAndroidColors(config, (c) => {
    c.modResults = addColors(c.modResults);
    return c;
  });
  config = withAndroidStyles(config, (c) => {
    c.modResults = addSplashStyle(c.modResults);
    return c;
  });
  config = withDangerousMod(config, [
    'android',
    (c) => {
      const res = path.join(c.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
      const root = c.modRequest.projectRoot;
      copyAsset(root, 'notification-icon.png', path.join(res, 'drawable-xxxhdpi', 'notification_icon.png'));
      // One logo (512 px = 128 dp at xxxhdpi): drop the other density copies so none shadows it.
      for (const density of DENSITIES) fs.rmSync(path.join(res, `drawable-${density}`, 'splashscreen_logo.png'), { force: true });
      copyAsset(root, 'splash-icon.png', path.join(res, 'drawable-xxxhdpi', 'splashscreen_logo.png'));
      fs.mkdirSync(path.join(res, 'drawable'), { recursive: true });
      fs.writeFileSync(path.join(res, 'drawable', 'splash_background.xml'), SPLASH_LAYER);
      return c;
    },
  ]);
  return config;
}

module.exports = withBrandAssets;
module.exports.addFcmDefaults = addFcmDefaults;
module.exports.addColors = addColors;
module.exports.addSplashStyle = addSplashStyle;
module.exports.BRAND_COLOR = BRAND_COLOR;
