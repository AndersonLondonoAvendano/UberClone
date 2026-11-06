// AI-assisted: see docs/AI_LOG.md #27
// AI-assisted: see docs/AI_LOG.md #34
// AI-assisted: see docs/AI_LOG.md #36
// Documents tab (minimal scope for this delivery): Mercado Pago email, terms checkbox with
// the commission percentage, and the "Enviar registro" button that submits the whole form.
// License/SOAT/technical review are out of scope for this delivery.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { CheckboxField } from '../../components/registration/CheckboxField';
import { FieldError } from '../../components/registration/FieldError';
import { TextField } from '../../components/registration/TextField';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { COMMISSION_RATE_PERCENT, useRegistrationForm } from '../../context/RegistrationFormContext';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
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
    isLocked,
  } = useRegistrationForm();
  const { accountStatus } = useAppState();

  const [termsTouched, setTermsTouched] = useState(false);
  const showErrors = visitedTabs.documents;
  const isAccountPending = accountStatus === ACCOUNT_STATUS.PENDING;

  const emailError =
    !isValidEmail(documents.mercadoPagoEmail) && (documents.touched.mercadoPagoEmail || showErrors)
      ? FIELDS.mercadoPagoEmail.error
      : null;
  const termsError =
    !isTermsAccepted(documents.termsAccepted) && (termsTouched || showErrors) ? FIELDS.termsAccepted.error : null;

  const termsLabel = labels.registration.documents.termsLabel.replace('{percent}', String(COMMISSION_RATE_PERCENT));
  const isSubmitting = submitState === 'submitting';
  // The account stays pending until an admin approves it elsewhere, so the submit action must
  // not be reachable again (no edit, no re-send) while it is pending.
  const canSubmit = isRegistrationValid && !isSubmitting && !isAccountPending;

  return (
    <PlaceholderScreen name="documents" title={labels.tabs.documents} leading={null} safeEdges={SAFE_EDGES}>
      <View style={{ gap: space[5] }}>
        {isAccountPending ? (
          <Text testID="documents-pending-notice" style={styles.pendingNotice}>
            {labels.registration.pendingNotice}
          </Text>
        ) : null}

        <TextField
          testID="documents-field-mp-email"
          errorTestID="documents-error-mp-email"
          label={FIELDS.mercadoPagoEmail.label}
          value={documents.mercadoPagoEmail}
          onChangeText={(value) => setDocumentsField('mercadoPagoEmail', value)}
          onBlur={() => touchDocumentsField('mercadoPagoEmail')}
          keyboardType="email-address"
          errorMessage={emailError}
          disabled={isLocked}
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
          disabled={isLocked}
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
        {submitState === 'success' ? (
          <Text testID="documents-submit-success" style={styles.submitSuccess}>
            {labels.registration.documents.submitSuccess}
          </Text>
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
    opacity: opacity.disabled,
  },
  submitButtonPressed: {
    opacity: opacity.pressed,
  },
  submitLabel: {
    ...type.label,
    color: color.onPrimary,
    textAlign: 'center',
  },
  submitSuccess: {
    ...type.label,
    color: color.success,
  },
  pendingNotice: {
    ...type.label,
    color: color.warning,
    backgroundColor: color.bg,
    borderWidth: borderWidth.thin,
    borderColor: color.warning,
    borderRadius: radius.sm,
    padding: space[3],
  },
});
