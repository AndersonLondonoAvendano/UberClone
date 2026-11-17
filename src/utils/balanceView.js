// AI-assisted: see AI_LOG.md #66
// Pure presentation of the platform balance (B1, CA-005-03, CA-005-06): which block the screen shows and
// the numbers in it. The balance comes from computeBalance over EVERY trip read (no 200 cap); an error
// never shows 0, and a truncated read is flagged as partial with the number of trips read.

import { computeBalance } from './earnings';

// status: 'loading' | 'ready' | 'error' | 'noSession'. Returns { kind, balance, count, partial }.
// kind: 'loading' | 'error' | 'noSession' | 'empty' | 'ready'. 'noSession' (C2a): there is no driver id, so
// there is nothing to read; it must not stay on "loading" forever and must not show a 0 balance.
export function buildBalanceView({ status, trips, truncated }) {
  const list = Array.isArray(trips) ? trips : [];
  if (status === 'noSession') return { kind: 'noSession', balance: 0, count: 0, partial: false };
  if (status === 'loading') return { kind: 'loading', balance: 0, count: 0, partial: false };
  if (status === 'error') return { kind: 'error', balance: 0, count: 0, partial: false };
  if (list.length === 0) return { kind: 'empty', balance: 0, count: 0, partial: false };
  return { kind: 'ready', balance: computeBalance(list), count: list.length, partial: truncated === true };
}
