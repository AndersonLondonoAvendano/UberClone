// AI-assisted: see docs/AI_LOG.md #26
// AI-assisted: see docs/AI_LOG.md #33
// AI-assisted: see docs/AI_LOG.md #34
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #54 (reset and useOptionalRegistrationForm)
// AI-assisted: see docs/AI_LOG.md #55 (license, SOAT and technical review fields, RF-41)
// Registration form state (useContext): the 17 fields across the three tabs, per-field "touched"
// flags and per-tab "visited" flags (DP-08), aggregate validity per tab and overall (RF-02), and
// the submit flow (RF-04). The plate is normalized to uppercase on every change, so the field
// never holds (or needs to re-derive) a lowercase value.

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { INITIAL_DOCUMENT_FIELDS, buildDocumentsPayload, documentsFromStored, validateDocumentFields } from '../utils/documentsMapping';
import { useAppState } from './AppStateContext';
import { getDriverRegistration, submitDriverRegistration } from '../services/driverRepository';
import { labels, getSubmitErrorMessage } from '../constants/labels';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { COMMISSION_RATE } from '../config/pricing';
import { applySuggestion } from '../i18n/applySuggestion';

// RF-07/RF-21 (T-38): the commission rate comes only from src/config/pricing.js as a fraction
// (0.2). It is shown on the terms checkbox as a percentage and stored with the registration as the
// fraction. A rate stored in an older document is ignored: COMMISSION_RATE always applies.
// AI-assisted: see docs/AI_LOG.md #43

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
  ...INITIAL_DOCUMENT_FIELDS,
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

// Inverse of toIsoDateString: builds the Date from its local year/month/day components
// (never from the `new Date(isoString)` UTC parsing, which can shift the day in some
// timezones) so a round trip through Firestore returns the same calendar date shown before.
function fromIsoDateString(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const RegistrationFormContext = createContext(null);

export function RegistrationFormProvider({ children }) {
  const { driverId, accountStatus } = useAppState();

  const [personalData, setPersonalDataState] = useState(INITIAL_PERSONAL_DATA);
  const [personalDataTouched, setPersonalDataTouched] = useState(() => emptyTouched(INITIAL_PERSONAL_DATA));
  const [vehicle, setVehicleState] = useState(INITIAL_VEHICLE);
  const [vehicleTouched, setVehicleTouched] = useState(() => emptyTouched(INITIAL_VEHICLE));
  const [documents, setDocumentsState] = useState(INITIAL_DOCUMENTS);
  const commissionRate = COMMISSION_RATE;
  const [documentsTouched, setDocumentsTouched] = useState(() => emptyTouched(INITIAL_DOCUMENTS));
  const [visitedTabs, setVisitedTabs] = useState(INITIAL_VISITED_TABS);
  const [submitState, setSubmitState] = useState('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState(null);

  // RF-03/RF-04: preload personalData/vehicle/documents already saved in drivers/{uid} once
  // driverId resolves, so a driver who already submitted sees their own data instead of an empty
  // form. hasPreloadedRef guarantees this runs at most once ever, so it never overwrites an
  // in-progress edit if driverId is read again later.
  // AI-assisted: see docs/AI_LOG.md #34
  const hasPreloadedRef = useRef(false);
  useEffect(() => {
    if (!driverId || hasPreloadedRef.current) return;
    hasPreloadedRef.current = true;

    let isMounted = true;
    getDriverRegistration(driverId).then((stored) => {
      if (!isMounted || !stored) return;
      if (stored.personalData) {
        const { birthDate, ...restPersonalData } = stored.personalData;
        // AI-assisted: see docs/AI_LOG.md #67
        // RI-08: the stored language is only a suggestion for the app language (once, never saved).
        applySuggestion(restPersonalData.language);
        setPersonalDataState((current) => ({
          ...current,
          ...restPersonalData,
          birthDate: birthDate ? fromIsoDateString(birthDate) : current.birthDate,
        }));
      }
      if (stored.vehicle) {
        const { year, capacity, ...restVehicle } = stored.vehicle;
        setVehicleState((current) => ({
          ...current,
          ...restVehicle,
          year: year === undefined || year === null ? current.year : String(year),
          capacity: capacity === undefined || capacity === null ? current.capacity : String(capacity),
        }));
      }
      if (stored.documents) {
        // AI-assisted: see docs/AI_LOG.md #55
        // documentsFromStored maps the nested stored structure (license, soat, technicalReview) to
        // the flat form fields and ignores commissionRate, so nothing unexpected enters the state.
        setDocumentsState((current) => ({ ...current, ...documentsFromStored(stored.documents) }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [driverId]);

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

  // AI-assisted: see docs/AI_LOG.md #54
  // Session reset: empties the form and lets the next uid preload its own saved registration.
  const reset = useCallback(() => {
    hasPreloadedRef.current = false;
    setPersonalDataState(INITIAL_PERSONAL_DATA);
    setPersonalDataTouched(emptyTouched(INITIAL_PERSONAL_DATA));
    setVehicleState(INITIAL_VEHICLE);
    setVehicleTouched(emptyTouched(INITIAL_VEHICLE));
    setDocumentsState(INITIAL_DOCUMENTS);
    setDocumentsTouched(emptyTouched(INITIAL_DOCUMENTS));
    setVisitedTabs(INITIAL_VISITED_TABS);
    setSubmitState('idle');
    setSubmitErrorMessage(null);
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

  // AI-assisted: see docs/AI_LOG.md #55
  // Tab 3 is valid with the email, the terms and the new document fields; the technical review is
  // only checked when the vehicle year requires it (the vehicle year comes from tab 2).
  const documentFields = useMemo(() => validateDocumentFields(documents, vehicle.year), [documents, vehicle.year]);
  const isDocumentsValid = useMemo(
    () =>
      isValidEmail(documents.mercadoPagoEmail) && isTermsAccepted(documents.termsAccepted) && documentFields.isValid,
    [documents, documentFields],
  );

  const isRegistrationValid = isPersonalDataValid && isVehicleValid && isDocumentsValid;

  // A single derived value locks every field across the three tabs once the registration was
  // submitted successfully in this session, or once an existing registration preloaded with
  // accountStatus already "pending". A failed submit (submitState === 'error') keeps the form
  // editable so the driver can retry.
  const isLocked = accountStatus === ACCOUNT_STATUS.PENDING || submitState === 'success';

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

    // Trim only here, at the submit boundary, not on every keystroke
    // (setPersonalDataField/setVehicleField/setDocumentsField): trimming while typing would eat a
    // space the driver just typed before the next word of a multi-word name.
    // AI-assisted: see docs/AI_LOG.md #34
    const personalDataPayload = {
      ...personalData,
      fullName: personalData.fullName.trim(),
      email: personalData.email.trim(),
    };
    const vehiclePayload = {
      ...vehicle,
      year: vehicleYear,
      capacity: vehicleCapacity,
      brand: vehicle.brand.trim(),
      model: vehicle.model.trim(),
    };
    // AI-assisted: see docs/AI_LOG.md #55
    // Revalidate the dates with a fresh clock (they may have expired since the form was filled)
    // and build the nested documents structure; the technical review goes out as null when the
    // vehicle year does not require it.
    if (!validateDocumentFields(documents, vehicleYear).isValid) {
      setSubmitState('error');
      setSubmitErrorMessage(labels.registration.documents.submitError);
      return;
    }
    const documentsPayload = buildDocumentsPayload(documents, vehicleYear, { commissionRate });

    try {
      await submitDriverRegistration(driverId, {
        personalData: { ...personalDataPayload, birthDate: toIsoDateString(personalData.birthDate) },
        vehicle: vehiclePayload,
        documents: documentsPayload,
      });
      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
      setSubmitErrorMessage(getSubmitErrorMessage(error.code));
    }
  }, [isRegistrationValid, driverId, personalData, vehicle, documents, commissionRate]);

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
      documentFields,
      commissionRate,

      visitedTabs,
      markTabVisited,

      isRegistrationValid,
      submitState,
      submitErrorMessage,
      submitRegistration,
      isLocked,
      reset,
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
      documentFields,
      commissionRate,
      visitedTabs,
      markTabVisited,
      isRegistrationValid,
      submitState,
      submitErrorMessage,
      submitRegistration,
      isLocked,
      reset,
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

// AI-assisted: see docs/AI_LOG.md #54
// Tolerant read for code that may run outside the provider (useSessionReset): null when absent
// (the main branch does not mount the registration form).
export function useOptionalRegistrationForm() {
  return useContext(RegistrationFormContext);
}
