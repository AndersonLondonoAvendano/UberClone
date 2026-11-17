// AI-assisted: see AI_LOG.md #67
// T-261 (CA-006-24, 25, 26): services, utils and constants read the active language when called,
// never when the module loads; stored values do not change with the language.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import './helpers/registerSrcLoader.mjs';

const store = await import('../../src/i18n/languageStore.js');
const { exitCopy } = await import('../../src/services/trip/exitCopy.js');
const { closedReasonText, CLOSED_REASON } = await import('../../src/services/trip/requestClosed.js');
const { tripDetailView } = await import('../../src/services/trip/tripDetailView.js');
const { legacyPaymentChip } = await import('../../src/services/trip/legacyTrip.js');
const { serviceErrorText, chargePanel } = await import('../../src/services/trip/chargePanel.js');
const { groupNetEarnings } = await import('../../src/utils/chartData.js');
const { validateRange } = await import('../../src/utils/dateRanges.js');
const { mapAuthError } = await import('../../src/utils/authErrors.js');
const { validateLicenseNumber, validateExpiry } = await import('../../src/utils/documentValidators.js');
const { validateDocumentFields } = await import('../../src/utils/documentsMapping.js');
const options = await import('../../src/constants/registrationOptions.js');
const { isValidGender, isValidLanguage, isValidVehicleCategory, isValidVehicleColor } = await import('../../src/utils/validators.js');

// Same call in Spanish and then in English must differ (the module was loaded once, in Spanish).
function differs(name, call) {
  store.init('es');
  const es = JSON.stringify(call());
  store.init('en');
  const en = JSON.stringify(call());
  store.init('es');
  assert.ok(es && en && es !== en, `${name}: same text in both languages (${es})`);
}

test('services return other text after switching language between two calls', () => {
  differs('exitCopy', () => exitCopy({ status: 'inProgress' }));
  differs('exitCopy server', () => exitCopy({ status: 'accepted', serverError: true }));
  differs('closedReasonText', () => closedReasonText(CLOSED_REASON.EXPIRED));
  differs('closedReasonText unavailable', () => closedReasonText(CLOSED_REASON.UNAVAILABLE));
  differs('tripDetailView', () => tripDetailView({ status: 'cancelled', paymentMethod: 'cash' }));
  differs('legacyPaymentChip', () => legacyPaymentChip({}));
  differs('serviceErrorText', () => serviceErrorText('zzz-unknown'));
  differs('chargePanel', () => chargePanel({ method: 'cash', paymentStatus: 'pending' }).message);
});

test('utils return other text after switching language between two calls', () => {
  const monday = Date.UTC(2025, 0, 6, 17, 0, 0);
  differs('chartData weekdays', () => groupNetEarnings([], 'week', null, monday).map((g) => g.label));
  differs('validateRange missing', () => validateRange(null, null).error);
  differs('mapAuthError login', () => mapAuthError('login', { code: 'auth/network-request-failed' }).message);
  differs('validateLicenseNumber', () => validateLicenseNumber('').error);
  differs('validateExpiry', () => validateExpiry('nope').error);
  differs('validateDocumentFields', () => validateDocumentFields({}, 2020, new Date(Date.UTC(2025, 0, 6))));
});

test('registration options: label follows the language, value does not', () => {
  const groups = [options.GENDER_OPTIONS, options.LANGUAGE_OPTIONS, options.VEHICLE_CATEGORY_OPTIONS, options.VEHICLE_COLOR_OPTIONS];
  store.init('es');
  const valuesEs = groups.map((g) => g.map((o) => o.value));
  const labelsEs = groups.map((g) => g.map((o) => o.label));
  store.init('en');
  const valuesEn = groups.map((g) => g.map((o) => o.value));
  const labelsEn = groups.map((g) => g.map((o) => o.label));
  store.init('es');
  assert.deepEqual(valuesEs, valuesEn);
  assert.deepEqual(valuesEs[1], ['es', 'en']);
  assert.deepEqual(valuesEs[0], ['femenino', 'masculino', 'otro', 'prefiero-no-decir']);
  assert.deepEqual(valuesEs[2], ['economico', 'xl', 'premium']);
  for (let i = 0; i < groups.length; i += 1) {
    assert.notDeepEqual(labelsEs[i], labelsEn[i], `group ${i}`);
    labelsEn[i].forEach((label) => assert.equal(typeof label, 'string'));
  }
  // The validators accept the stored values in either language.
  store.init('en');
  assert.ok(isValidGender('femenino') && isValidLanguage('en') && isValidVehicleCategory('xl') && isValidVehicleColor('blanco'));
  store.init('es');
});

test('chart weekday labels keep the order of weekdaysShort in each language', async () => {
  const { labels } = await import('../../src/constants/labels.js');
  const monday = Date.UTC(2025, 0, 6, 17, 0, 0);
  for (const language of ['es', 'en']) {
    store.init(language);
    assert.deepEqual(groupNetEarnings([], 'week', null, monday).map((g) => g.label), [...labels.history.weekdaysShort]);
  }
  store.init('es');
});

// CA-006-25 and CA-006-26: nothing in these folders builds a dialog or a local notification.
test('no Alert.alert and no local notification in services, utils or constants', () => {
  const root = fileURLToPath(new URL('../../src/', import.meta.url));
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = `${dir}${entry.name}`;
      if (entry.isDirectory()) walk(`${path}/`);
      else if (path.endsWith('.js')) files.push(path);
    }
  };
  for (const folder of ['services/', 'utils/', 'constants/']) walk(`${root}${folder}`);
  assert.ok(files.length > 40);
  const found = files.filter((file) => /Alert\.alert|scheduleNotificationAsync|presentNotificationAsync/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(found, []);
});
