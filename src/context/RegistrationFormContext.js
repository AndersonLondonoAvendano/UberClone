// AI-assisted: see docs/AI_LOG.md #26
// AI-assisted: see docs/AI_LOG.md #33
// Registration form state (useContext): the 17 fields across the three tabs, per-field "touched"
// flags and per-tab "visited" flags (DP-08), aggregate validity per tab and overall (RF-02), and
// the submit flow (RF-04). The plate is normalized to uppercase on every change, so the field
// never holds (or needs to re-derive) a lowercase value.

import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';
import {
  isValidFullName,
  isValidDocumentNumber,
  isValidPhone,
  isAdultBirthDate,
  isValidGender,
  isValidEmail,
  isValidLanguage,
  isValidVehicleCategory,
  normalizePlate,
  isValidPlate,
  isValidBrandOrModel,
  isValidVehicleYear,
  isValidVehicleColor,
  isValidCapacity,
  isNonEmptyUrl,
  isTermsAccepted,
} from '../utils/validators';
import { useAppState } from './AppStateContext';
import { submitDriverRegistration } from '../services/driverRepository';
import { labels, getSubmitErrorMessage } from '../constants/labels';

// RF-07/RF-21: 20% is the only fare/commission figure this spec needs (shown on the terms
// checkbox, T-26, and stored with the registration). It stays local on purpose: the shared
// pricing config and its pure fare function are the fare spec's (004) deliverable, not this one's.
export const COMMISSION_RATE_PERCENT = 20;

const INITIAL_PERSONAL_DATA = {
  fullName: '',
  documentNumber: '',
  phone: '',
  birthDate: null,
  gender: '',
  email: '',
  language: '',
  profilePhotoUrl: '',
};
const INITIAL_VEHICLE = {
  category: '',
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  photoUrl: '',
};
const INITIAL_DOCUMENTS = {
  mercadoPagoEmail: '',
  termsAccepted: false,
};
const INITIAL_VISITED_TABS = { personalData: false, vehicle: false, documents: false };

function emptyTouched(shape) {
  return Object.keys(shape).reduce((acc, key) => ({ ...acc, [key]: false }), {});
}

function toIsoDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const RegistrationFormContext = createContext(null);

export function RegistrationFormProvider({ children }) {
  const { driverId } = useAppState();

  const [personalData, setPersonalDataState] = useState(INITIAL_PERSONAL_DATA);
  const [personalDataTouched, setPersonalDataTouched] = useState(() => emptyTouched(INITIAL_PERSONAL_DATA));
  const [vehicle, setVehicleState] = useState(INITIAL_VEHICLE);
  const [vehicleTouched, setVehicleTouched] = useState(() => emptyTouched(INITIAL_VEHICLE));
  const [documents, setDocumentsState] = useState(INITIAL_DOCUMENTS);
  const [documentsTouched, setDocumentsTouched] = useState(() => emptyTouched(INITIAL_DOCUMENTS));
  const [visitedTabs, setVisitedTabs] = useState(INITIAL_VISITED_TABS);
  const [submitState, setSubmitState] = useState('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState(null);

  const setPersonalDataField = useCallback((key, value) => {
    setPersonalDataState((current) => ({ ...current, [key]: value }));
  }, []);
  const touchPersonalDataField = useCallback((key) => {
    setPersonalDataTouched((current) => ({ ...current, [key]: true }));
  }, []);

  const setVehicleField = useCallback((key, value) => {
    setVehicleState((current) => ({ ...current, [key]: key === 'plate' ? normalizePlate(value) : value }));
  }, []);
  const touchVehicleField = useCallback((key) => {
    setVehicleTouched((current) => ({ ...current, [key]: true }));
  }, []);

  const setDocumentsField = useCallback((key, value) => {
    setDocumentsState((current) => ({ ...current, [key]: value }));
  }, []);
  const touchDocumentsField = useCallback((key) => {
    setDocumentsTouched((current) => ({ ...current, [key]: true }));
  }, []);

  const markTabVisited = useCallback((tab) => {
    setVisitedTabs((current) => ({ ...current, [tab]: true }));
  }, []);

  const isPersonalDataValid = useMemo(
    () =>
      isValidFullName(personalData.fullName) &&
      isValidDocumentNumber(personalData.documentNumber) &&
      isValidPhone(personalData.phone) &&
      personalData.birthDate instanceof Date &&
      isAdultBirthDate(personalData.birthDate) &&
      isValidGender(personalData.gender) &&
      isValidEmail(personalData.email) &&
      isValidLanguage(personalData.language) &&
      isNonEmptyUrl(personalData.profilePhotoUrl),
    [personalData],
  );

  const isVehicleValid = useMemo(
    () =>
      isValidVehicleCategory(vehicle.category) &&
      isValidPlate(vehicle.plate) &&
      isValidBrandOrModel(vehicle.brand) &&
      isValidBrandOrModel(vehicle.model) &&
      isValidVehicleYear(vehicle.year) &&
      isValidVehicleColor(vehicle.color) &&
      isValidCapacity(vehicle.capacity, vehicle.category) &&
      isNonEmptyUrl(vehicle.photoUrl),
    [vehicle],
  );

  const isDocumentsValid = useMemo(
    () => isValidEmail(documents.mercadoPagoEmail) && isTermsAccepted(documents.termsAccepted),
    [documents],
  );

  const isRegistrationValid = isPersonalDataValid && isVehicleValid && isDocumentsValid;

  const submitRegistration = useCallback(async () => {
    if (!isRegistrationValid || !driverId) return;
    setSubmitState('submitting');
    setSubmitErrorMessage(null);

    // Firestore rules require vehicle.year/vehicle.capacity as number, but the form state keeps
    // them as strings (so VehicleScreen's controlled TextFields keep working). Convert and
    // revalidate right before sending, without mutating the string-based form state.
    const vehicleYear = Number(vehicle.year);
    const vehicleCapacity = Number(vehicle.capacity);
    if (!isValidVehicleYear(vehicleYear) || !isValidCapacity(vehicleCapacity, vehicle.category)) {
      setSubmitState('error');
      setSubmitErrorMessage(labels.registration.documents.submitError);
      return;
    }
    const vehiclePayload = { ...vehicle, year: vehicleYear, capacity: vehicleCapacity };

    try {
      await submitDriverRegistration(driverId, {
        personalData: { ...personalData, birthDate: toIsoDateString(personalData.birthDate) },
        vehicle: vehiclePayload,
        documents: { ...documents, commissionRate: COMMISSION_RATE_PERCENT },
      });
      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
      setSubmitErrorMessage(getSubmitErrorMessage(error.code));
    }
  }, [isRegistrationValid, driverId, personalData, vehicle, documents]);

  const value = useMemo(
    () => ({
      personalData: { ...personalData, touched: personalDataTouched },
      setPersonalDataField,
      touchPersonalDataField,
      isPersonalDataValid,

      vehicle: { ...vehicle, touched: vehicleTouched },
      setVehicleField,
      touchVehicleField,
      isVehicleValid,

      documents: { ...documents, touched: documentsTouched },
      setDocumentsField,
      touchDocumentsField,
      isDocumentsValid,

      visitedTabs,
      markTabVisited,

      isRegistrationValid,
      submitState,
      submitErrorMessage,
      submitRegistration,
    }),
    [
      personalData,
      personalDataTouched,
      setPersonalDataField,
      touchPersonalDataField,
      isPersonalDataValid,
      vehicle,
      vehicleTouched,
      setVehicleField,
      touchVehicleField,
      isVehicleValid,
      documents,
      documentsTouched,
      setDocumentsField,
      touchDocumentsField,
      isDocumentsValid,
      visitedTabs,
      markTabVisited,
      isRegistrationValid,
      submitState,
      submitErrorMessage,
      submitRegistration,
    ],
  );

  return createElement(RegistrationFormContext.Provider, { value }, children);
}

export function useRegistrationForm() {
  const context = useContext(RegistrationFormContext);
  if (context === null) {
    throw new Error('useRegistrationForm must be used inside a RegistrationFormProvider');
  }
  return context;
}
