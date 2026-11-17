// AI-assisted: see AI_LOG.md #68
// Language control without a session (T-270; CA-006-35 to 42, RI-25). There is no renderer in the test setup,
// so the screens and the component are checked by reading their source; the store runs for real.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/registerSrcLoader.mjs';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const section = read('src/components/settings/LanguageSection.js');
const layout = read('src/components/auth/AuthScreenLayout.js');
const placeholder = read('src/components/PlaceholderScreen.js');
const { es } = await import('../../src/i18n/dictionaries/es.js');
const { en } = await import('../../src/i18n/dictionaries/en/index.js');
const { createLanguageStore } = await import('../../src/i18n/languageStore.js');
const { createLanguagePreference } = await import('../../src/i18n/languagePreference.js');
const { touch } = await import('../../src/theme/tokens.js');

const memoryStorage = () => {
  const map = new Map();
  return { map, getItem: async (k) => map.get(k) ?? null, setItem: async (k, v) => void map.set(k, v) };
};

const TABS = ['PersonalDataScreen', 'VehicleScreen', 'DocumentsScreen'];

test('CA-006-35: the control is on welcome, login, sign-up (layout) and each registration tab', () => {
  assert.match(read('src/screens/registration/WelcomeScreen.js'), /<LanguageSection compact \/>/);
  assert.match(layout, /<LanguageSection compact \/>/);
  for (const name of ['LoginScreen', 'SignUpScreen']) {
    assert.match(read(`src/screens/auth/${name}.js`), /<AuthScreenLayout /, `${name} uses the shared layout`);
  }
  for (const name of TABS) {
    assert.match(read(`src/screens/registration/${name}.js`), /<PlaceholderScreen [^>]*showLanguageSwitch/, name);
  }
  assert.match(placeholder, /showLanguageSwitch \? <LanguageSection compact \/> : null/);
  assert.match(placeholder, /showLanguageSwitch = false/);
});

test('CA-006-35: Settings keeps its own section and does not turn the compact one on (never two controls)', () => {
  const settings = read('src/screens/main/SettingsScreen.js');
  assert.match(settings, /<LanguageSection \/>/);
  assert.doesNotMatch(settings, /showLanguageSwitch|compact/);
  for (const name of ['EarningsScreen', 'ProfileScreen']) {
    assert.doesNotMatch(read(`src/screens/main/${name}.js`), /showLanguageSwitch/);
  }
});

test('UI files that read text call useLanguage()', () => {
  for (const f of ['src/components/auth/AuthScreenLayout.js', 'src/components/PlaceholderScreen.js', 'src/screens/registration/WelcomeScreen.js']) {
    assert.match(read(f), /useLanguage\(\)/, f);
  }
});

test('CA-006-36: radio role, selected only on the active, icon besides colour, height >= 48 dp; compact is discreet but tappable', () => {
  assert.match(section, /accessibilityRole="radio"/);
  assert.match(section, /accessibilityRole="radiogroup"/);
  assert.match(section, /accessibilityState=\{\{ selected, checked: selected \}\}/);
  assert.match(section, /const selected = language === option\.code/);
  assert.match(section, /name="checkmark-circle"/);
  assert.match(section, /minHeight: touch\.controlHeight/);
  assert.ok(touch.controlHeight >= 48);
  // The compact variant is small to the eye but keeps a >= 44 dp touch area, wraps, and marks the active
  // option without relying on colour only (underline + stronger font); no border/background/icon/"Active".
  assert.ok(touch.min >= 44);
  assert.match(section, /optionCompact: \{[^}]*minHeight: touch\.min/);
  assert.match(section, /optionCompact: \{[^}]*minWidth: touch\.min/);
  assert.match(section, /hitSlop=/);
  assert.match(section, /compactLine: \{[^}]*flexWrap: 'wrap'/);
  assert.match(section, /nameCompactActive: \{[^}]*textDecorationLine: 'underline'/);
  assert.match(section, /nameCompact: \{ \.\.\.type\.caption/);
  assert.doesNotMatch(section, /(optionCompact|nameCompact\w*|compactLine|compactOptions): \{[^}]*(borderWidth|backgroundColor)/);
  assert.equal((section.match(/styles\.activeText/g) ?? []).length, 1, 'the "Active" text exists only in the full variant');
  assert.equal((section.match(/name="checkmark-circle"/g) ?? []).length, 1, 'the check icon exists only in the full variant');
  assert.doesNotMatch(section, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(section, /\bAlert\b/);
});

test('CA-006-37: no own save logic, no appLanguage or AsyncStorage in the control or the screens', () => {
  const files = [
    'src/components/settings/LanguageSection.js',
    'src/components/auth/AuthScreenLayout.js',
    'src/components/PlaceholderScreen.js',
    'src/screens/registration/WelcomeScreen.js',
    'src/screens/auth/LoginScreen.js',
    'src/screens/auth/SignUpScreen.js',
    ...TABS.map((n) => `src/screens/registration/${n}.js`),
  ];
  for (const f of files) {
    const src = read(f);
    assert.doesNotMatch(src, /appLanguage|AsyncStorage/, f);
  }
  assert.match(section, /import \{ setLanguage \} from '\.\.\/\.\.\/i18n\/languageStore'/);
  assert.equal((section.match(/setLanguage\(/g) ?? []).length, 1);
  assert.doesNotMatch(layout, /setLanguage/);
});

test('CA-006-38: choosing en from the control saves appLanguage = en and the next resolution returns en', async () => {
  const storage = memoryStorage();
  const preference = createLanguagePreference({ storage });
  const store = createLanguageStore({ preference });
  assert.deepEqual(await store.setLanguage('en'), { saved: true });
  assert.equal(store.getLanguage(), 'en');
  assert.equal(storage.map.get('appLanguage'), 'en');
  // "Reopen": a fresh preference over the same storage reads back en.
  assert.equal(await createLanguagePreference({ storage }).get(), 'en');
  // Rapid toggles: the last one wins, in memory and on disk.
  await Promise.all([store.setLanguage('es'), store.setLanguage('en'), store.setLanguage('es')]);
  assert.equal(store.getLanguage(), 'es');
  assert.equal(storage.map.get('appLanguage'), 'es');
});

test('CA-006-39: no Firestore or repository involved in the control or its layouts', () => {
  for (const src of [section, layout, placeholder]) {
    assert.doesNotMatch(src, /firestore|firebase|Repository|validProfileEdit/i);
  }
  assert.doesNotMatch(read('firestore.rules'), /appLanguage/);
});

test('CA-006-40: changing the language does not touch or remount the registration state', () => {
  // The language lives in its own store; the control never imports the registration context or navigation.
  assert.doesNotMatch(section, /RegistrationFormContext|useRegistrationForm|navigation|useNavigation|key=\{language\}/);
  // The layouts render the control as a sibling, with no key tied to the language, so nothing remounts.
  for (const src of [layout, placeholder, read('src/screens/registration/WelcomeScreen.js')]) {
    assert.doesNotMatch(src, /key=\{[^}]*language[^}]*\}/i);
  }
  // The form state belongs to the provider above the tabs, not to the language.
  const ctx = read('src/context/RegistrationFormContext.js');
  assert.doesNotMatch(ctx, /useLanguage|languageStore|setLanguage/);
  // The component keeps only its own save-failed flag; form state is not in it.
  assert.match(section, /useState\(false\)/);
  assert.equal((section.match(/useState\(/g) ?? []).length, 1);
});

test('CA-006-17 (limit case): a failing save still changes the language and does not throw', async () => {
  const store = createLanguageStore({ preference: { set: async () => { throw new Error('disk full'); } } });
  assert.deepEqual(await store.setLanguage('en'), { saved: false });
  assert.equal(store.getLanguage(), 'en');
  assert.match(section, /language-not-saved/);
});

test('CA-006-41: initial resolution untouched (the same files as before, no change in resolve/init)', () => {
  assert.doesNotMatch(section, /resolveLanguage|initLanguage|applySuggestion/);
  assert.doesNotMatch(layout, /resolveLanguage|initLanguage|applySuggestion/);
});

test('CA-006-42: the title key is in es and en with the same text, same keys (parity)', () => {
  assert.equal(es.settings.language.title, 'Idioma / Language');
  assert.equal(en.settings.language.title, 'Idioma / Language');
  assert.deepEqual(Object.keys(es.settings.language), Object.keys(en.settings.language));
  assert.match(section, /text\.title/);
});
