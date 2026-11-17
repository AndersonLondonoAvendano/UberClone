// AI-assisted: see AI_LOG.md #55
// Pure policy for the Home map (F1b, RF-39): when the phone position is tracked and when it is
// published. Tracking is local (a dot on the map) while Home is focused; publishing to
// driverLocations happens only while the driver is Disponible with an approved account.
export function locationPolicy({ available, accountApproved, permissionGranted, focused }) {
  const allowed = Boolean(permissionGranted) && Boolean(accountApproved);
  return {
    track: allowed && (Boolean(available) || Boolean(focused)),
    publish: allowed && Boolean(available),
  };
}
