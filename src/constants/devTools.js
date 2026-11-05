// AI-assisted: see docs/AI_LOG.md #35
// Single on/off switch for every provisional test panel (force-state selector, account simulator,
// "simular solicitud"). A constant on purpose, not an env var: no new dependency, no .env entry,
// nothing to configure per machine. The value committed to the repository must stay FALSE — this is
// a delivery, not a dev build, and it must not show any test panel. Anderson may set it to TRUE in
// his own local, uncommitted copy while developing, and must set it back to FALSE before committing.
export const SHOW_DEV_TOOLS = false;
