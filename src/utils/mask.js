// AI-assisted: see docs/AI_LOG.md #50
// Masks an email for display: "anderson@gmail.com" -> "an*****@gmail.com". The full address is
// never shown on the payment block or the profile.
export function maskEmail(email) {
  const value = String(email ?? '').trim();
  const at = value.lastIndexOf('@');
  if (at < 1) return '';
  const local = value.slice(0, at);
  const domain = value.slice(at);
  const visible = local.slice(0, Math.min(2, Math.max(1, local.length - 1)));
  return `${visible}${'*'.repeat(Math.max(3, local.length - visible.length))}${domain}`;
}
