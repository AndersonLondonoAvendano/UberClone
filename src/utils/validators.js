// AI-assisted: see docs/AI_LOG.md #25
import { GENDER_OPTIONS, LANGUAGE_OPTIONS, VEHICLE_CATEGORY_OPTIONS, VEHICLE_COLOR_OPTIONS } from '../constants/registrationOptions';

const FULL_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{1,50}$/;
const DIGITS_6_TO_10 = /^\d{6,10}$/;
const PHONE_10_DIGITS = /^\d{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLATE_PATTERN = /^[A-Z]{3}\d{3}$/;

function isNonEmptyTrimmed(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidFullName(value) {
  return typeof value === 'string' && isNonEmptyTrimmed(value) && FULL_NAME_PATTERN.test(value.trim());
}

export function isValidDocumentNumber(value) {
  return typeof value === 'string' && DIGITS_6_TO_10.test(value);
}

export function isValidPhone(value) {
  return typeof value === 'string' && PHONE_10_DIGITS.test(value);
}

export function isAdultBirthDate(date, today = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  let age = today.getFullYear() - date.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= 18;
}

export function isValidGender(value) {
  return GENDER_OPTIONS.some((option) => option.value === value);
}

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value);
}

export function isValidLanguage(value) {
  return LANGUAGE_OPTIONS.some((option) => option.value === value);
}

export function isValidVehicleCategory(value) {
  return VEHICLE_CATEGORY_OPTIONS.some((option) => option.value === value);
}

export function normalizePlate(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function isValidPlate(normalizedValue) {
  return typeof normalizedValue === 'string' && PLATE_PATTERN.test(normalizedValue);
}

export function isValidBrandOrModel(value) {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 30;
}

export function isValidVehicleYear(value, currentYear = new Date().getFullYear()) {
  const year = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(year) && String(Math.abs(year)).length === 4 && year <= currentYear;
}

export function isValidVehicleColor(value) {
  return VEHICLE_COLOR_OPTIONS.some((option) => option.value === value);
}

export function isValidCapacity(value, category) {
  const capacity = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(capacity) || capacity <= 0) return false;
  if (category === 'xl') return capacity >= 6;
  return true;
}

export function isNonEmptyUrl(value) {
  return isNonEmptyTrimmed(value);
}

export function isTermsAccepted(value) {
  return value === true;
}
