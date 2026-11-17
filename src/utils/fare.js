// AI-assisted: see AI_LOG.md #42
// Pure fare calculation (RF-20 to RF-22): no React, no network, no side effects. Parameters come
// from src/config/pricing.js.
//
// Rounding, in this order:
//   1. raw = (base + perKm * distanceKm + perMinute * durationMin) * categoryMultiplier
//   2. fare = max(raw, minimum fare), rounded to the nearest 100 COP (halves go up: Math.round)
//   3. commission = fare * COMMISSION_RATE, rounded to the nearest peso (Math.round)
//   4. driverEarnings = fare - commission + tip (the tip goes entirely to the driver, not rounded
//      beyond whole pesos)
// Example (RF-22, 8.5 km, 22 min): economico 19 200 / 3 840 / 15 360; xl 26 900 / 5 380 / 21 520.

import {
  BASE_FARE_COP,
  CATEGORY_MULTIPLIERS,
  COMMISSION_RATE,
  FARE_ROUNDING_COP,
  MINIMUM_FARE_COP,
  PER_KM_COP,
  PER_MINUTE_COP,
} from '../config/pricing';

export const INVALID_FARE_INPUT = 'INVALID_FARE_INPUT';

function fareInputError(message) {
  const error = new Error(message);
  error.code = INVALID_FARE_INPUT;
  return error;
}

const isNonNegativeNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

const roundTo = (value, step) => Math.round(value / step) * step;

export function calculateFare({ distanceKm, durationMin, category, tip = 0 } = {}) {
  if (!isNonNegativeNumber(distanceKm)) throw fareInputError('distanceKm must be a number >= 0');
  if (!isNonNegativeNumber(durationMin)) throw fareInputError('durationMin must be a number >= 0');
  if (!Object.prototype.hasOwnProperty.call(CATEGORY_MULTIPLIERS, category)) {
    throw fareInputError('category must be one of: ' + Object.keys(CATEGORY_MULTIPLIERS).join(', '));
  }
  if (!isNonNegativeNumber(tip)) throw fareInputError('tip must be a number >= 0');

  const raw = (BASE_FARE_COP + PER_KM_COP * distanceKm + PER_MINUTE_COP * durationMin) * CATEGORY_MULTIPLIERS[category];
  const fare = roundTo(Math.max(raw, MINIMUM_FARE_COP), FARE_ROUNDING_COP);
  const commission = Math.round(fare * COMMISSION_RATE);
  const driverEarnings = fare - commission + Math.round(tip);
  return { fare, commission, driverEarnings };
}

// Reads a stored commission rate. Old registrations saved it as a percentage (20); new ones save
// the fraction (0.2). A value greater than 1 is read as a percentage. Returns null when the value
// is not a usable rate, so the caller keeps the configured COMMISSION_RATE.
export function normalizeCommissionRate(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  const rate = value > 1 ? value / 100 : value;
  return rate <= 1 ? rate : null;
}

// Whole percentage for display: 0.2 -> 20.
export const commissionPercent = (rate) => Math.round(rate * 100);
