// AI-assisted: see docs/AI_LOG.md #67
// T-255: changing the language never contaminates saved values, fares, trip state, the decision timer,
// the sign-out cleanup or Firestore (CA-006-14, 16, 20, 31, 32). Real store/labels/fare/record/controller
// with fakes for storage, API, clock and timers.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/registerSrcLoader.mjs';

const { createLanguageStore } = await import('../../src/i18n/languageStore.js');
const { createLanguagePreference, LANGUAGE_KEY } = await import('../../src/i18n/languagePreference.js');
const { labels } = await import('../../src/constants/labels.js');
const realStore = await import('../../src/i18n/languageStore.js');
const { calculateFare } = await import('../../src/utils/fare.js');
const { buildTripRecord, SAVED_STATUS } = await import('../../src/services/trip/tripRecord.js');
const { createTripController } = await import('../../src/services/trip/tripController.js');
const { createDecisionWindow } = await import('../../src/services/trip/decisionWindow.js');
const { closedReasonText, CLOSED_REASON } = await import('../../src/services/trip/requestClosed.js');
const { resetSession } = await import('../../src/services/session/resetSession.js');
const { buildSessionResetDeps } = await import('../../src/services/session/buildSessionResetDeps.js');
const { createNotificationPreference } = await import('../../src/services/notifications/preference.js');

const memoryStorage = (seed = {}) => {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: async (k) => map.get(k) ?? null,
    setItem: async (k, v) => void map.set(k, v),
    removeItem: async (k) => void map.delete(k),
  };
};
const makeStore = (storage) => createLanguageStore({ preference: createLanguagePreference({ storage }) });

const SAMPLE = { distanceKm: 8.5, durationMin: 22, category: 'economico' };
const baseRequest = (extra = {}) => ({
  id: 'r1',
  passengerId: 'p1',
  passenger: { name: 'Ana' },
  origin: { lat: 4.6, lng: -74.08, address: 'Origen' },
  destination: { lat: 4.7, lng: -74.1, address: 'Destino' },
  ...SAMPLE,
  paymentMethod: 'cash',
  ...extra,
});

test('CA-006-32: the example fare is the same with es and en', async () => {
  const store = makeStore(memoryStorage());
  const seen = [];
  for (const language of ['es', 'en', 'es']) {
    await store.setLanguage(language);
    seen.push(calculateFare(SAMPLE));
  }
  assert.deepEqual(seen[0], { fare: 19200, commission: 3840, driverEarnings: 15360 });
  for (const fare of seen) assert.deepEqual(fare, seen[0]);
});

test('CA-006-31: saved records are identical in es and en while the shown text changes', async () => {
  const cases = [];
  for (const status of [SAVED_STATUS.COMPLETED, SAVED_STATUS.CANCELLED, SAVED_STATUS.REJECTED]) {
    for (const category of ['economico', 'xl']) {
      for (const paymentMethod of ['cash', 'card']) {
        cases.push({ status, request: baseRequest({ category, paymentMethod, tip: 1000, rating: 5 }) });
      }
    }
  }
  const build = () =>
    cases.map(({ status, request }) =>
      buildTripRecord({ driverId: 'd1', tripId: 't1', request, status, startedAt: 1000, finishedAt: 5000 }),
    );
  const storage = memoryStorage();
  const store = makeStore(storage);
  const shown = {};
  const records = {};
  for (const language of ['es', 'en']) {
    await realStore.setLanguage(language);
    await store.setLanguage(language);
    records[language] = JSON.stringify(build());
    shown[language] = [labels.trip.accept, labels.trip.expired, closedReasonText(CLOSED_REASON.UNAVAILABLE)];
  }
  await realStore.setLanguage('es');
  assert.equal(records.es, records.en);
  assert.ok(JSON.parse(records.es).length === 12);
  for (let i = 0; i < shown.es.length; i += 1) assert.notEqual(shown.es[i], shown.en[i]);
  // Only the preference key was written by the language change.
  assert.deepEqual([...storage.map.keys()], [LANGUAGE_KEY]);
});

test('CA-006-20: with a trip in progress and an open request, changing language alters nothing', async () => {
  const reports = [];
  const timers = new Map();
  let nextId = 1;
  const setTimer = (fn, ms) => {
    const id = nextId++;
    timers.set(id, { fn, ms });
    return id;
  };
  const clearTimer = (id) => timers.delete(id);
  const now = () => 100000;
  const request = baseRequest();
  const controller = createTripController({
    trip: { id: 't1', request, acceptedAt: 90000 },
    startPosition: { lat: 4.5, lng: -74.0 },
    api: { reportTripStatus: async (_i, s) => void reports.push(s), cancelTrip: async () => ({}), reportDriverLocation: async () => {} },
    getRoute: async () => ({ coordinates: [[-74.08, 4.6], [-74.1, 4.7]], distanceM: 5000, durationS: 600, provider: 'osrm' }),
    buildStraightLineRoute: () => ({ coordinates: [], distanceM: 1, durationS: 1, provider: 'straight' }),
    createLocationSource: () => ({ start: () => () => {} }),
    config: {
      ROUTE_MAX_ATTEMPTS: 1, ROUTE_RETRY_DELAY_MS: 0, REPORT_MAX_ATTEMPTS: 1, REPORT_RETRY_DELAY_MS: 0,
      REPORT_ATTEMPT_TIMEOUT_MS: 50, FINISH_TIMEOUT_MS: 100, ARRIVAL_THRESHOLD_M: 1,
      REPORT_MIN_INTERVAL_MS: 5000, REPORT_MIN_DISTANCE_M: 20,
    },
    now,
    setTimer,
    clearTimer,
  });
  await controller.start();
  await new Promise((resolve) => setTimeout(resolve, 10)); // let the first status report settle

  // Open request: the decision window is counted from the first time it was shown.
  const decision = createDecisionWindow();
  const open = { id: 'r2', createdAt: 99000, expiresAt: 130000 };
  decision.markShown(open.id, 99000);
  const deadlineBefore = decision.deadline(open, now());
  const remainingBefore = decision.remainingMs(open, now());

  const stateBefore = JSON.stringify(controller.getState());
  const fareBefore = calculateFare(SAMPLE);
  const timersBefore = JSON.stringify([...timers.entries()].map(([id, t]) => [id, t.ms]));
  const reportsBefore = [...reports];

  const store = makeStore(memoryStorage());
  await store.setLanguage('en');
  await realStore.setLanguage('en');
  void labels.trip.accept;
  await store.setLanguage('es');
  await realStore.setLanguage('es');

  assert.equal(JSON.stringify(controller.getState()), stateBefore);
  assert.equal(JSON.stringify([...timers.entries()].map(([id, t]) => [id, t.ms])), timersBefore);
  assert.deepEqual(reports, reportsBefore);
  assert.equal(decision.deadline(open, now()), deadlineBefore);
  assert.equal(decision.remainingMs(open, now()), remainingBefore);
  assert.deepEqual(calculateFare(SAMPLE), fareBefore);
  const { fare, commission, driverEarnings } = fareBefore;
  assert.deepEqual({ fare, commission, driverEarnings }, { fare: 19200, commission: 3840, driverEarnings: 15360 });
  controller.dispose();
});

test('CA-006-16: sign-out cleanup keeps the language preference', async () => {
  const storage = memoryStorage({ notificationsEnabled: 'true' });
  const store = makeStore(storage);
  await store.setLanguage('en');
  const notifications = createNotificationPreference({ storage });
  const log = [];
  const deps = buildSessionResetDeps({
    getAvailability: () => null,
    getTrip: () => null,
    getAppState: () => null,
    getRegistration: () => null,
    publishIdleStatus: async () => {},
    waitForTripSaveQueue: async () => {},
    unregisterNotifications: async () => {
      await notifications.clear();
      log.push('unregister');
    },
    signOut: async () => void log.push('signOut'),
  });
  const result = await resetSession(deps);
  assert.equal(result.ok, true);
  assert.deepEqual(log, ['unregister', 'signOut']);
  assert.equal(storage.map.has('notificationsEnabled'), false, 'the cleanup did run');
  assert.equal(storage.map.get(LANGUAGE_KEY), 'en');
  // A new resolution (reopen after sign-out) still reads English.
  assert.equal(await createLanguagePreference({ storage }).get(), 'en');
});

test('CA-006-14: no Firestore write and no profile-edit rule change for the language', async () => {
  // The language store only talks to its preference; a repository fake is never reached.
  const writes = [];
  const repository = { setDoc: () => writes.push('setDoc'), updateDoc: () => writes.push('updateDoc') };
  const storage = memoryStorage();
  const store = makeStore(storage);
  await store.setLanguage('en');
  assert.deepEqual(writes, []);
  void repository;
  assert.deepEqual([...storage.map.keys()], [LANGUAGE_KEY]);

  // The language modules import nothing from Firebase or the repositories.
  for (const file of ['languageStore', 'languagePreference', 'translate', 'liveLabels', 'languages']) {
    const source = readFileSync(new URL(`../../src/i18n/${file}.js`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /firebase|firestore|tripRepository|profileRepository|updateDoc|setDoc/i, file);
  }

  // validProfileEdit still allows exactly the four fields and mentions no language.
  const rules = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
  const start = rules.indexOf('function validProfileEdit()');
  assert.ok(start > 0);
  const body = rules.slice(start, rules.indexOf('allow read', start));
  assert.doesNotMatch(body, /language|appLanguage/i);
  assert.match(body, /hasOnly\(\['personalData', 'vehicle', 'documents', 'updatedAt'\]\)/);
  assert.match(body, /hasOnly\(\['fullName', 'phone'\]\)/);
  assert.match(body, /hasOnly\(\['color'\]\)/);
  assert.match(body, /hasOnly\(\['mercadoPagoEmail'\]\)/);
});
