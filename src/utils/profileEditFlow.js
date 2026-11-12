// AI-assisted: see docs/AI_LOG.md #60
// Pure edit-flow state machine for the profile (R13, DP-54). No React, Firebase or React Native.
import { PROFILE_FIELDS, buildProfilePayload, canSave, profileValuesFrom, validateProfileDraft } from './profileEdit';

function initialState(uid) {
  return {
    uid: uid ?? null,
    mode: 'read',
    phase: 'idle',
    baseline: null,
    draft: null,
    touched: {},
    errors: {},
    canSave: false,
  };
}

// Errors are exposed only for fields the user already changed or left (DP-54).
function visibleErrors(draft, touched) {
  const { errors } = validateProfileDraft(draft);
  const visible = {};
  for (const field of Object.keys(errors)) if (touched[field]) visible[field] = true;
  return visible;
}

export function createProfileEditFlow({ save } = {}) {
  let state = initialState(null);
  // Bumped on every reset so a late save response from a previous session is ignored.
  let epoch = 0;
  const listeners = new Set();

  function emit(next) {
    state = next;
    for (const listener of [...listeners]) listener(state);
  }

  function withDraft(draft, touched, extra = {}) {
    return {
      ...state,
      ...extra,
      draft,
      touched,
      errors: visibleErrors(draft, touched),
      canSave: canSave(state.baseline, draft),
    };
  }

  function start(uid, profile) {
    if (state.mode !== 'read' || !uid) return;
    const baseline = profileValuesFrom(profile);
    emit({
      ...initialState(uid),
      mode: 'edit',
      baseline,
      draft: { ...baseline },
      canSave: false,
    });
  }

  function change(field, value) {
    if (state.mode !== 'edit' || state.phase === 'saving' || !PROFILE_FIELDS.includes(field)) return;
    const draft = { ...state.draft, [field]: value };
    const touched = { ...state.touched, [field]: true };
    // Editing after a failed save clears the error phase; the draft is kept.
    emit(withDraft(draft, touched, { phase: state.phase === 'error' ? 'idle' : state.phase }));
  }

  function touch(field) {
    if (state.mode !== 'edit' || !PROFILE_FIELDS.includes(field) || state.touched[field]) return;
    emit(withDraft(state.draft, { ...state.touched, [field]: true }));
  }

  function cancel() {
    if (state.mode !== 'edit' || state.phase === 'saving') return;
    // Discards the draft without calling save (CA-002-134).
    emit(initialState(state.uid));
  }

  async function run() {
    if (state.mode !== 'edit' || state.phase === 'saving' || !state.canSave || typeof save !== 'function') return;
    const uid = state.uid;
    const payload = buildProfilePayload(state.draft);
    const myEpoch = epoch;
    emit({ ...state, phase: 'saving' });
    try {
      await save(uid, payload);
    } catch {
      if (myEpoch !== epoch || state.uid !== uid) return;
      emit({ ...state, phase: 'error' });
      return;
    }
    if (myEpoch !== epoch || state.uid !== uid) return;
    emit({ ...initialState(uid), phase: 'saved' });
  }

  function submit() {
    return run();
  }

  function retry() {
    if (state.phase !== 'error') return Promise.resolve();
    return run();
  }

  function reset(uid) {
    epoch += 1;
    emit(initialState(uid));
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start,
    change,
    touch,
    cancel,
    submit,
    retry,
    reset,
  };
}
