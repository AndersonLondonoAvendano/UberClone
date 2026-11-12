// AI-assisted: see docs/AI_LOG.md #50
// Pure period totals for the earnings screen (T-47). Day, week and month limits use the device's
// LOCAL time. The week starts on MONDAY (Colombian calendar) and ends the next Monday at 00:00
// (exclusive). Only completed trips add up; cancelled ones are ignored. Tips do not exist in this
// app, so the net earning is the saved driverEarnings (fare minus commission).

import { TRIP_STATUS } from '../constants/tripStatus';

export const PERIOD = { DAY: 'day', WEEK: 'week', MONTH: 'month' };

// Epoch ms of a saved date: number, Date or Firestore Timestamp ({ toMillis }). NaN when unknown.
export function toMillis(value) {
  if (value == null) return NaN;
  if (typeof value === 'number') return value;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return NaN;
}

// [start, end) of the period that contains `now`, in local time.
export function periodRange(period, now = Date.now()) {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  if (period === PERIOD.MONTH) return { start: new Date(y, m, 1).getTime(), end: new Date(y, m + 1, 1).getTime() };
  if (period === PERIOD.WEEK) {
    const sinceMonday = (d.getDay() + 6) % 7;
    return {
      start: new Date(y, m, day - sinceMonday).getTime(),
      end: new Date(y, m, day - sinceMonday + 7).getTime(),
    };
  }
  return { start: new Date(y, m, day).getTime(), end: new Date(y, m, day + 1).getTime() };
}

const amount = (value) => (Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0);

// trips: [{ status, finishedAt, fare, commission, driverEarnings, ... }]. Returns the totals and the
// completed trips of the period, most recent first.
export function computePeriodTotals(trips, period, now = Date.now()) {
  const { start, end } = periodRange(period, now);
  const inPeriod = (Array.isArray(trips) ? trips : [])
    .filter((trip) => {
      if (trip?.status !== TRIP_STATUS.COMPLETED) return false;
      const at = toMillis(trip.finishedAt);
      return Number.isFinite(at) && at >= start && at < end;
    })
    .sort((a, b) => toMillis(b.finishedAt) - toMillis(a.finishedAt));
  return {
    net: inPeriod.reduce((sum, trip) => sum + amount(trip.driverEarnings), 0),
    commission: inPeriod.reduce((sum, trip) => sum + amount(trip.commission), 0),
    gross: inPeriod.reduce((sum, trip) => sum + amount(trip.fare), 0),
    count: inPeriod.length,
    trips: inPeriod,
  };
}

// AI-assisted: see docs/AI_LOG.md #55 (T-99, CA-002-75)
// Balance with the platform: card payments (Mercado Pago, approved) leave the platform owing the driver
// their earnings; cash trips leave the driver owing the platform its commission. Positive = the platform
// owes the driver; negative = the driver owes the platform. Trips without a valid method are ignored.
export function computeBalance(trips) {
  let balance = 0;
  if (!Array.isArray(trips)) return 0;
  for (const trip of trips) {
    if (!trip || typeof trip !== 'object') continue;
    if (trip.status === TRIP_STATUS.CANCELLED) continue;
    if (trip.paymentMethod === 'mercadopago') {
      if (trip.paymentStatus !== 'approved') continue;
      balance += amount(trip.driverEarnings);
    } else if (trip.paymentMethod === 'cash') {
      if (trip.paymentStatus !== 'paid' && trip.status !== 'paid') continue;
      balance -= amount(trip.commission);
    }
  }
  return Number.isFinite(balance) ? balance : 0;
}
