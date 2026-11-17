// AI-assisted: see AI_LOG.md #42
// Fare parameters (RF-21), in whole Colombian pesos (COP). Single source of the platform commission
// the registration, the request card and the trip summary all read COMMISSION_RATE from here.

// Platform commission as a fraction of the fare (0.20 = 20 %).
export const COMMISSION_RATE = 0.2;

export const BASE_FARE_COP = 3500;
export const PER_KM_COP = 1200;
export const PER_MINUTE_COP = 250;
export const MINIMUM_FARE_COP = 6000;

// The fare is rounded to the nearest multiple of this value before the commission (RF-22).
export const FARE_ROUNDING_COP = 100;

// Category multipliers. Keys match the vehicle category values of the registration (RF-06).
export const CATEGORY_MULTIPLIERS = {
  economico: 1.0,
  xl: 1.4,
  premium: 1.8,
};
