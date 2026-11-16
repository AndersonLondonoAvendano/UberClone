// AI-assisted: see docs/AI_LOG.md #64
// Pure helpers over the permission states of constants.js (T-180).
import { PERMISSION_STATE } from './constants';

// Push can be received (granted, or not applicable on this OS version, which the adapter maps to granted).
export const canReceivePush = (state) => state === PERMISSION_STATE.GRANTED;

// The system dialog will not appear again: the user has to go to the system settings.
export const needsSystemSettings = (state) => state === PERMISSION_STATE.BLOCKED;

// A runtime request is worth trying.
export const canAskPermission = (state) => state === PERMISSION_STATE.DENIED;

export const isSupported = (state) => state !== PERMISSION_STATE.UNSUPPORTED;
