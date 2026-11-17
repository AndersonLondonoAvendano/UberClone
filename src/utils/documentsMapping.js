// AI-assisted: see AI_LOG.md #55
// Pure mapping between the flat documents form state and the drivers/{uid}.documents structure
// (RF-41), plus the validity of the new documents fields. No React Native imports so it runs
// under plain Node (scripts/tests/documentsMapping.test.mjs).
//
// Form state keys (flat): licenseNumber, licensePhotoUrl, licenseExpiresAt, soatPhotoUrl,
// soatExpiresAt, technicalReviewPhotoUrl, technicalReviewExpiresAt. Expiry dates are Date objects
// in the form and 'YYYY-MM-DD' strings in the stored document.

import { labels } from '../constants/labels.js';
import {
  colombiaYear,
  requiresTechnicalReview,
  validateExpiry,
  validateLicenseNumber,
} from './documentValidators.js';

const FIELDS = labels.registration.documents.fields;

export const INITIAL_DOCUMENT_FIELDS = {
  licenseNumber: '',
  licensePhotoUrl: '',
  licenseExpiresAt: null,
  soatPhotoUrl: '',
  soatExpiresAt: null,
  technicalReviewPhotoUrl: '',
  technicalReviewExpiresAt: null,
};

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function toIsoDate(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return value;
}

// Builds the Date from local year/month/day (never from UTC parsing), like the birth date.
function fromIsoDate(isoDate) {
  if (typeof isoDate !== 'string') return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

// Error text (or null) for each new documents field. The technical review fields are only checked
// when the review is required for the vehicle year.
export function validateDocumentFields(documents, vehicleYear, now = new Date()) {
  const technicalReview = requiresTechnicalReview(vehicleYear, colombiaYear(now));
  const errors = {
    licenseNumber: validateLicenseNumber(documents.licenseNumber).valid ? null : FIELDS.licenseNumber.error,
    licensePhotoUrl: isNonEmptyText(documents.licensePhotoUrl) ? null : FIELDS.licensePhotoUrl.error,
    licenseExpiresAt: validateExpiry(documents.licenseExpiresAt, now).valid ? null : FIELDS.licenseExpiresAt.error,
    soatPhotoUrl: isNonEmptyText(documents.soatPhotoUrl) ? null : FIELDS.soatPhotoUrl.error,
    soatExpiresAt: validateExpiry(documents.soatExpiresAt, now).valid ? null : FIELDS.soatExpiresAt.error,
    technicalReviewPhotoUrl: null,
    technicalReviewExpiresAt: null,
  };
  if (technicalReview.required) {
    errors.technicalReviewPhotoUrl = isNonEmptyText(documents.technicalReviewPhotoUrl)
      ? null
      : FIELDS.technicalReviewPhotoUrl.error;
    errors.technicalReviewExpiresAt = validateExpiry(documents.technicalReviewExpiresAt, now).valid
      ? null
      : FIELDS.technicalReviewExpiresAt.error;
  }
  const isValid = Object.values(errors).every((error) => error === null);
  return { errors, technicalReview, isValid };
}

// Document stored in drivers/{uid}.documents. When the technical review is not required its photo
// and expiry are sent as null even if the form still holds stale values.
export function buildDocumentsPayload(documents, vehicleYear, { commissionRate, now = new Date() } = {}) {
  const technicalReview = requiresTechnicalReview(vehicleYear, colombiaYear(now));
  return {
    mercadoPagoEmail: documents.mercadoPagoEmail.trim(),
    termsAccepted: documents.termsAccepted,
    commissionRate,
    license: {
      number: documents.licenseNumber.trim(),
      photoUrl: documents.licensePhotoUrl,
      expiresAt: toIsoDate(documents.licenseExpiresAt),
    },
    soat: {
      photoUrl: documents.soatPhotoUrl,
      expiresAt: toIsoDate(documents.soatExpiresAt),
    },
    technicalReview: {
      required: technicalReview.required,
      photoUrl: technicalReview.required ? documents.technicalReviewPhotoUrl : null,
      expiresAt: technicalReview.required ? toIsoDate(documents.technicalReviewExpiresAt) : null,
    },
  };
}

// Flat form fields from a stored document (preload). Accounts saved before R7 have no
// license/soat/technicalReview: they yield only the keys that exist, so nothing is blocked.
export function documentsFromStored(stored) {
  if (!stored || typeof stored !== 'object') return {};
  const fields = {};
  if (typeof stored.mercadoPagoEmail === 'string') fields.mercadoPagoEmail = stored.mercadoPagoEmail;
  if (typeof stored.termsAccepted === 'boolean') fields.termsAccepted = stored.termsAccepted;
  if (stored.license) {
    fields.licenseNumber = stored.license.number ?? '';
    fields.licensePhotoUrl = stored.license.photoUrl ?? '';
    fields.licenseExpiresAt = fromIsoDate(stored.license.expiresAt);
  }
  if (stored.soat) {
    fields.soatPhotoUrl = stored.soat.photoUrl ?? '';
    fields.soatExpiresAt = fromIsoDate(stored.soat.expiresAt);
  }
  if (stored.technicalReview) {
    fields.technicalReviewPhotoUrl = stored.technicalReview.photoUrl ?? '';
    fields.technicalReviewExpiresAt = fromIsoDate(stored.technicalReview.expiresAt);
  }
  return fields;
}
