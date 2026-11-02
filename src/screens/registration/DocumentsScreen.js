// AI-assisted: see docs/AI_LOG.md #27
// Documents tab (minimal scope for this delivery): Mercado Pago email, terms checkbox with
// the commission percentage, and the "Enviar registro" button that submits the whole form.
// License/SOAT/technical review are out of scope for this delivery.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { CheckboxField } from '../../components/registration/CheckboxField';
import { FieldError } from '../../components/registration/FieldError';
import { TextField } from '../../components/registration/TextField';
import { labels } from '../../constants/labels';
import { COMMISSION_RATE_PERCENT, useRegistrationForm } from '../../context/RegistrationFormContext';
import { color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { isValidEmail, isTermsAccepted } from '../../utils/validators';

const SAFE_EDGES = ['top'];
const FIELDS = labels.registration.documents.fields;

export function DocumentsScreen() {
  const {
    documents,
    setDocumentsField,
    touchDocumentsField,
    visitedTabs,
    isRegistrationValid,
    submitState,
    submitErrorMessage,
    submitRegistration,
  } = useRegistrationForm();

  const [termsTouched, setTermsTouched] = useState(false);
  const showErrors = visitedTabs.documents;

  const emailError =
    !isValidEmail(documents.mercadoPagoEmail) && (documents.touched.mercadoPagoEmail || showErrors)
      ? FIELDS.mercadoPagoEmail.error
      : null;
  const termsError =
    !isTermsAccepted(documents.termsAccepted) && (termsTouched || showErrors) ? FIELDS.termsAccepted.error : null;

  const termsLabel = labels.registration.documents.termsLabel.replace('{percent}', String(COMMISSION_RATE_PERCENT));
  const isSubmitting = submitState === 'submitting';
  const canSubmit = isRegistrationValid && !isSubmitting;

  return (
    <PlaceholderScreen name="documents" title={labels.tabs.documents} leading={null} safeEdges={SAFE_EDGES}>
      <View style={{ gap: space[5] }}>
        <TextField
          testID="documents-field-mp-email"
          errorTestID="documents-error-mp-email"
          label={FIELDS.mercadoPagoEmail.label}
          value={documents.mercadoPagoEmail}
          onChangeText={(value) => setDocumentsField('mercadoPagoEmail', value)}
          onBlur={() => touchDocumentsField('mercadoPagoEmail')}
          keyboardType="email-address"
          errorMessage={emailError}
        />

        <CheckboxField
          testID="documents-field-terms"
          errorTestID="documents-error-terms"
          label={termsLabel}
          checked={documents.termsAccepted}
          onChange={(value) => {
            setDocumentsField('termsAccepted', value);
            setTermsTouched(true);
          }}
          errorMessage={termsError}
        />

        <Pressable
          testID="documents-submit"
          accessibilityRole="button"
          accessibilityLabel={labels.registration.documents.submit}
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={submitRegistration}
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && styles.submitButtonPressed,
          ]}
        >
          <Text style={styles.submitLabel}>
            {isSubmitting ? labels.registration.documents.submitting : labels.registration.documents.submit}
          </Text>
        </Pressable>
        {submitState === 'error' ? (
          <FieldError testID="documents-error-submit" message={submitErrorMessage || labels.registration.documents.submitError} />
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    alignSelf: 'stretch',
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[4],
    backgroundColor: color.primary,
    borderRadius: radius.md,
  },
  submitButtonDisabled: {
    opacity: opacity.pressed,
  },
  submitButtonPressed: {
    opacity: opacity.pressed,
  },
  submitLabel: {
    ...type.label,
    color: color.onPrimary,
    textAlign: 'center',
  },
});
