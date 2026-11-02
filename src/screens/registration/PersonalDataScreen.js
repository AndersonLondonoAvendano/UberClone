// AI-assisted: see docs/AI_LOG.md #26
// Personal data tab: the 8 real fields of RF-05, backed by RegistrationFormContext. A field shows
// its error once it was touched (blurred) or once this tab was visited and left (DP-08), never on
// a fresh, untouched render.

import { View } from 'react-native';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { DateField } from '../../components/registration/DateField';
import { PhotoField } from '../../components/registration/PhotoField';
import { SelectField } from '../../components/registration/SelectField';
import { TextField } from '../../components/registration/TextField';
import { labels } from '../../constants/labels';
import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from '../../constants/registrationOptions';
import { useRegistrationForm } from '../../context/RegistrationFormContext';
import { space } from '../../theme/tokens';
import {
  isValidFullName,
  isValidDocumentNumber,
  isValidPhone,
  isAdultBirthDate,
  isValidGender,
  isValidEmail,
  isValidLanguage,
  isNonEmptyUrl,
} from '../../utils/validators';

const SAFE_EDGES = ['top'];
const FIELDS = labels.registration.personalData.fields;

export function PersonalDataScreen() {
  const {
    personalData,
    setPersonalDataField,
    touchPersonalDataField,
    visitedTabs,
  } = useRegistrationForm();

  const showErrors = visitedTabs.personalData;
  const errorFor = (key, isValid) =>
    !isValid && (personalData.touched[key] || showErrors) ? FIELDS[key].error : null;

  return (
    <PlaceholderScreen name="personal-data" title={labels.tabs.personalData} leading={null} safeEdges={SAFE_EDGES}>
      <View style={{ gap: space[5] }}>
        <PhotoField
          testID="personal-data-field-photo"
          errorTestID="personal-data-error-photo"
          label={FIELDS.profilePhotoUrl.label}
          value={personalData.profilePhotoUrl}
          onChange={(url) => setPersonalDataField('profilePhotoUrl', url)}
          errorMessage={errorFor('profilePhotoUrl', isNonEmptyUrl(personalData.profilePhotoUrl))}
        />

        <TextField
          testID="personal-data-field-full-name"
          errorTestID="personal-data-error-full-name"
          label={FIELDS.fullName.label}
          value={personalData.fullName}
          onChangeText={(value) => setPersonalDataField('fullName', value)}
          onBlur={() => touchPersonalDataField('fullName')}
          maxLength={50}
          errorMessage={errorFor('fullName', isValidFullName(personalData.fullName))}
        />

        <TextField
          testID="personal-data-field-document-number"
          errorTestID="personal-data-error-document-number"
          label={FIELDS.documentNumber.label}
          value={personalData.documentNumber}
          onChangeText={(value) => setPersonalDataField('documentNumber', value)}
          onBlur={() => touchPersonalDataField('documentNumber')}
          keyboardType="number-pad"
          maxLength={10}
          errorMessage={errorFor('documentNumber', isValidDocumentNumber(personalData.documentNumber))}
        />

        <TextField
          testID="personal-data-field-phone"
          errorTestID="personal-data-error-phone"
          label={FIELDS.phone.label}
          value={personalData.phone}
          onChangeText={(value) => setPersonalDataField('phone', value)}
          onBlur={() => touchPersonalDataField('phone')}
          keyboardType="number-pad"
          maxLength={10}
          errorMessage={errorFor('phone', isValidPhone(personalData.phone))}
        />

        <DateField
          testID="personal-data-field-birth-date"
          errorTestID="personal-data-error-birth-date"
          label={FIELDS.birthDate.label}
          value={personalData.birthDate}
          onChange={(date) => {
            setPersonalDataField('birthDate', date);
            touchPersonalDataField('birthDate');
          }}
          maximumDate={new Date()}
          errorMessage={errorFor(
            'birthDate',
            personalData.birthDate instanceof Date && isAdultBirthDate(personalData.birthDate),
          )}
        />

        <SelectField
          testID="personal-data-field-gender"
          errorTestID="personal-data-error-gender"
          label={FIELDS.gender.label}
          options={GENDER_OPTIONS}
          value={personalData.gender}
          onChange={(value) => {
            setPersonalDataField('gender', value);
            touchPersonalDataField('gender');
          }}
          errorMessage={errorFor('gender', isValidGender(personalData.gender))}
        />

        <TextField
          testID="personal-data-field-email"
          errorTestID="personal-data-error-email"
          label={FIELDS.email.label}
          value={personalData.email}
          onChangeText={(value) => setPersonalDataField('email', value)}
          onBlur={() => touchPersonalDataField('email')}
          keyboardType="email-address"
          errorMessage={errorFor('email', isValidEmail(personalData.email))}
        />

        <SelectField
          testID="personal-data-field-language"
          errorTestID="personal-data-error-language"
          label={FIELDS.language.label}
          options={LANGUAGE_OPTIONS}
          value={personalData.language}
          onChange={(value) => {
            setPersonalDataField('language', value);
            touchPersonalDataField('language');
          }}
          errorMessage={errorFor('language', isValidLanguage(personalData.language))}
        />

        <DevAccountSwitch />
      </View>
    </PlaceholderScreen>
  );
}
