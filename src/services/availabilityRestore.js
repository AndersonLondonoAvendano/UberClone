// AI-assisted: see docs/AI_LOG.md #72
// Decides whether the saved "Disponible" is restored when the app opens with a restored session (T-289, D-201).
// Pure: the preference and the location source are injected. It never throws and never asks for anything.
//
// RULE: it restores "Disponible" ONLY if today every condition to turn it on holds:
//   1. this uid saved "Disponible" (a corrupt value or a failing read counts as "no"),
//   2. the account is approved,
//   3. there is no trip in progress,
//   4. the location permission is already granted (read only, no dialog) and the phone location is on
//      (read only, no dialog): the same two conditions enable() demands when the driver touches the switch.
// Otherwise it stays "No disponible", silently (no notice, no permission request).

export async function shouldRestoreAvailability({ uid, accountApproved, onTrip, preference, locationSource }) {
  try {
    if (!uid || accountApproved !== true || onTrip === true) return false;
    if ((await preference.get(uid)) !== true) return false;
    if ((await locationSource.getPermission()) !== 'granted') return false;
    return (await locationSource.checkServices()) === true;
  } catch {
    return false;
  }
}
