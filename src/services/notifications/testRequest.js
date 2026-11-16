// AI-assisted: see docs/AI_LOG.md #64
// Pure helpers of the "test request" control in Settings (T-186): the selectable delay and the mapping
// of a notificationsApi result to a UI state key. No React, no network.
import { NOTIFICATIONS_ERROR } from './notificationsApi';

export const TEST_DELAY_MIN = 0;
export const TEST_DELAY_MAX = 60;
export const TEST_DELAY_DEFAULT = 10;
export const TEST_DELAY_STEP = 5;

// Moves the delay by `direction` steps (+1 / -1), always inside [MIN, MAX].
export function stepDelay(current, direction) {
  const base = Number.isFinite(current) ? current : TEST_DELAY_DEFAULT;
  const next = base + direction * TEST_DELAY_STEP;
  return Math.min(TEST_DELAY_MAX, Math.max(TEST_DELAY_MIN, next));
}

export const TEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  OFFLINE: 'offline',
  RATE_LIMITED: 'rate-limited',
  NO_DEVICES: 'no-devices',
  SESSION: 'session',
  SERVER: 'server',
};

const ERROR_TO_STATUS = {
  [NOTIFICATIONS_ERROR.OFFLINE]: TEST_STATUS.OFFLINE,
  [NOTIFICATIONS_ERROR.RATE_LIMITED]: TEST_STATUS.RATE_LIMITED,
  [NOTIFICATIONS_ERROR.NO_DEVICES]: TEST_STATUS.NO_DEVICES,
  [NOTIFICATIONS_ERROR.SESSION]: TEST_STATUS.SESSION,
  [NOTIFICATIONS_ERROR.SERVER]: TEST_STATUS.SERVER,
};

export function statusFromResult(result) {
  if (result && result.ok) return TEST_STATUS.SUCCESS;
  return ERROR_TO_STATUS[result && result.error] ?? TEST_STATUS.SERVER;
}
