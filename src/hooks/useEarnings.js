// AI-assisted: see docs/AI_LOG.md #56
// Earnings of the screen (T-108, RNF-03): metrics of Today, Week and Month plus the balance with the
// platform, memoised. The calculation itself is the pure buildEarnings (src/utils/earnings.js).

import { useMemo } from 'react';
import { buildEarnings } from '../utils/earnings';

// now is optional: when omitted the clock is read only when trips change, so the memo stays useful.
export function useEarnings(trips, now) {
  return useMemo(() => buildEarnings(trips, now ?? Date.now()), [trips, now]);
}
