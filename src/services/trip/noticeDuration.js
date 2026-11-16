// AI-assisted: see docs/AI_LOG.md #67
// Pure duration of the brief notice of the request card (A3): the base time times the system font scale,
// so the text is readable in full at 200 %, with a ceiling (NOTICE_MAX_MS) so it never lingers.

import { NOTICE_MAX_MS } from '../../config/trip';

export { NOTICE_MAX_MS };

// fontScale below 1 or invalid counts as 1 (a smaller font never shortens the base time).
export function noticeDurationMs(baseMs, fontScale, maxMs = NOTICE_MAX_MS) {
  const scale = Number.isFinite(fontScale) && fontScale > 1 ? fontScale : 1;
  return Math.min(Math.round(baseMs * scale), maxMs);
}
