// AI-assisted: see docs/AI_LOG.md #61
// Pure generator of the simulated passenger feedback (D-124): a tip in whole COP and a 1-5 rating for
// the driver. Used only by the mock adapter; the real API would send these fields itself. The random
// source is injected (default Math.random) so a script can reproduce the exact values.
//
// tip:    0 for ~60 % of the trips; otherwise a multiple of 500 between 500 and 5000.
// rating: 4-5 for most trips (80 %), 3 for 14 %, 1-2 rarely (6 %).

export const TIP_STEP_COP = 500;
export const TIP_MAX_COP = 5000;
export const TIP_PROBABILITY = 0.4;

const RATING_FIVE_FROM = 0.55; // r >= 0.55 -> 5 (45 %)
const RATING_FOUR_FROM = 0.2; // 0.20 <= r < 0.55 -> 4 (35 %)
const RATING_THREE_FROM = 0.06; // 0.06 <= r < 0.20 -> 3 (14 %); r < 0.06 -> 1 or 2 (6 %)

// Draw order is fixed (tip gate, tip size, rating band, low rating) so the same RNG gives the same result.
export function generateFeedback(random = Math.random) {
  const steps = TIP_MAX_COP / TIP_STEP_COP;
  const hasTip = random() < TIP_PROBABILITY;
  const tipSteps = Math.min(steps, 1 + Math.floor(random() * steps));
  const tip = hasTip ? tipSteps * TIP_STEP_COP : 0;

  const band = random();
  const low = random() < 0.5 ? 1 : 2;
  let rating;
  if (band >= RATING_FIVE_FROM) rating = 5;
  else if (band >= RATING_FOUR_FROM) rating = 4;
  else if (band >= RATING_THREE_FROM) rating = 3;
  else rating = low;
  return { tip, rating };
}
