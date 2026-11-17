// AI-assisted: see AI_LOG.md #56
// Pure layout helper of the bar chart (T-104): with many bars only every Nth label is drawn so the
// labels never overlap. The accessibilityLabel of every bar always carries its own label and amount.

export const MAX_VISIBLE_LABELS = 8;

// Step between drawn labels: 1 up to MAX_VISIBLE_LABELS bars, then the smallest step that fits.
export function labelStep(barCount, maxLabels = MAX_VISIBLE_LABELS) {
  const count = Number.isFinite(barCount) ? Math.floor(barCount) : 0;
  if (count <= maxLabels || maxLabels < 1) return 1;
  return Math.ceil(count / maxLabels);
}

// True when the bar at `index` draws its label.
export function showsLabel(index, barCount, maxLabels = MAX_VISIBLE_LABELS) {
  return index % labelStep(barCount, maxLabels) === 0;
}
