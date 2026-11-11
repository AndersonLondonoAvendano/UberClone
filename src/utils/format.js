// AI-assisted: see docs/AI_LOG.md #43
// Display formatting for the trip screens (T-43 to T-45): pesos with "." thousands grouping,
// kilometers with a decimal comma and whole minutes. Display only: amounts come from calculateFare.

// Integer pesos: "$ 12.300".
export function formatCop(value) {
  const amount = Math.round(Number(value) || 0);
  const sign = amount < 0 ? '-' : '';
  const digits = String(Math.abs(amount));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$ ${grouped}`;
}

// Kilometers with one decimal and a comma: 2350 m -> "2,4". Built from integers (no toFixed).
export function formatKmFromMeters(meters) {
  const tenths = Math.max(0, Math.round((Number(meters) || 0) / 100));
  return `${Math.floor(tenths / 10)},${tenths % 10}`;
}

export const formatKm = (km) => formatKmFromMeters((Number(km) || 0) * 1000);

// Whole minutes, at least 1 while something remains: 61 s -> "2", 0 s -> "0".
export function formatMinutesFromSeconds(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  return String(value === 0 ? 0 : Math.max(1, Math.ceil(value / 60)));
}

// Clock time "14:05" in the phone's local time.
export function formatClock(timestamp) {
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Replaces {name} placeholders of a label.
export function fillLabel(template, values) {
  return Object.keys(values).reduce((text, key) => text.split(`{${key}}`).join(String(values[key])), template);
}
