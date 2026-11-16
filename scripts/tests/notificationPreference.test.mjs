// AI-assisted: see docs/AI_LOG.md #64
// Plain Node test for the notificationsEnabled preference (T-184, D-134). Injected storage.
//   node scripts/tests/notificationPreference.test.mjs
import assert from 'node:assert/strict';
import './helpers/registerSrcLoader.mjs';

const { createNotificationPreference, NOTIFICATIONS_ENABLED_KEY } = await import(
  '../../src/services/notifications/preference.js'
);

const memoryStorage = () => {
  const map = new Map();
  return {
    map,
    getItem: async (k) => (map.has(k) ? map.get(k) : null),
    setItem: async (k, v) => void map.set(k, v),
    removeItem: async (k) => void map.delete(k),
  };
};

assert.equal(NOTIFICATIONS_ENABLED_KEY, 'notificationsEnabled');

// Default off, persists, clears.
{
  const storage = memoryStorage();
  const pref = createNotificationPreference({ storage });
  assert.equal(await pref.get(), false);
  await pref.set(true);
  assert.equal(storage.map.get(NOTIFICATIONS_ENABLED_KEY), 'true');
  assert.equal(await pref.get(), true);
  await pref.set(false);
  assert.equal(await pref.get(), false);
  await pref.set(true);
  await pref.clear();
  assert.equal(storage.map.has(NOTIFICATIONS_ENABLED_KEY), false);
  assert.equal(await pref.get(), false);
}

// Only the exact string 'true' counts.
{
  const storage = memoryStorage();
  storage.map.set(NOTIFICATIONS_ENABLED_KEY, '1');
  assert.equal(await createNotificationPreference({ storage }).get(), false);
}

// A failing storage never throws: reads are false, writes report false.
{
  const boom = async () => {
    throw new Error('storage down');
  };
  const pref = createNotificationPreference({ storage: { getItem: boom, setItem: boom, removeItem: boom } });
  assert.equal(await pref.get(), false);
  assert.equal(await pref.set(true), false);
  await pref.clear();
}

console.log('notificationPreference tests passed');
