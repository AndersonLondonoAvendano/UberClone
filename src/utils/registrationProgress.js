// AI-assisted: see AI_LOG.md #60
// Pure helpers for the registration welcome screen (no React Native imports, testable with plain
// node). The completeness of each step is NOT recomputed here: it comes from the validity flags the
// RegistrationFormContext already derives (isPersonalDataValid, isVehicleValid, isDocumentsValid).

import { ACCOUNT_STATUS } from '../constants/accountStatus';

export const REGISTRATION_STEP = {
  PERSONAL_DATA: 'personalData',
  VEHICLE: 'vehicle',
  DOCUMENTS: 'documents',
};

// Order of the steps and the tab route each one opens.
export const REGISTRATION_STEPS = [
  { key: REGISTRATION_STEP.PERSONAL_DATA, route: 'PersonalData' },
  { key: REGISTRATION_STEP.VEHICLE, route: 'Vehicle' },
  { key: REGISTRATION_STEP.DOCUMENTS, route: 'Documents' },
];

// valid: { isPersonalDataValid, isVehicleValid, isDocumentsValid } (booleans).
// Returns the steps with their state, the completed count, the first incomplete step (null when all are
// complete) and the route the main action must open (the last tab, where the form is sent, when all
// steps are complete).
export function deriveRegistrationProgress(valid) {
  const flags = {
    [REGISTRATION_STEP.PERSONAL_DATA]: valid?.isPersonalDataValid === true,
    [REGISTRATION_STEP.VEHICLE]: valid?.isVehicleValid === true,
    [REGISTRATION_STEP.DOCUMENTS]: valid?.isDocumentsValid === true,
  };
  const steps = REGISTRATION_STEPS.map((step) => ({ ...step, complete: flags[step.key] }));
  const completedCount = steps.filter((step) => step.complete).length;
  const firstIncomplete = steps.find((step) => !step.complete) ?? null;
  const allComplete = firstIncomplete === null;
  const target = firstIncomplete ?? REGISTRATION_STEPS[REGISTRATION_STEPS.length - 1];
  return {
    steps,
    completedCount,
    total: steps.length,
    firstIncompleteKey: firstIncomplete ? firstIncomplete.key : null,
    allComplete,
    startRoute: target.route,
    action: allComplete ? 'review' : completedCount > 0 ? 'continue' : 'start',
  };
}

// The welcome screen only shows while the registration is not sent: not for a pending (in review) or
// approved account, nor right after a successful submit in this session.
export function shouldShowWelcome({ accountStatus, submitState }) {
  if (accountStatus === ACCOUNT_STATUS.PENDING || accountStatus === ACCOUNT_STATUS.APPROVED) return false;
  if (submitState === 'success') return false;
  return true;
}
