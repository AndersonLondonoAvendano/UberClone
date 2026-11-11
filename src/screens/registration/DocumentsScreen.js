// AI-assisted: see docs/AI_LOG.md #27
// AI-assisted: see docs/AI_LOG.md #34
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #42
// Documents tab (minimal scope for this delivery): Mercado Pago email, terms checkbox with
// the commission percentage, and the "Enviar registro" button that submits the whole form.
// License/SOAT/technical review are out of scope for this delivery.

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { CheckboxField } from '../../components/registration/CheckboxField';
import { FieldError } from '../../components/registration/FieldError';
import { TextField } from '../../components/registration/TextField';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { useRegistrationForm } from '../../context/RegistrationFormContext';
import { color, elevation, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { commissionPercent } from '../../utils/fare';
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
    commissionRate,
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

  const termsLabel = labels.registration.documents.termsLabel.replace(
    '{percent}',
    String(commissionPercent(commissionRate)),
  );
  const isSubmitting = submitState === 'submitting';
  // The account stays pending until an admin approves it elsewhere, so the submit action must
  // not be reachable again (no edit, no re-send) while it is pending.
  const canSubmit = isRegistrationValid && !isSubmitting && !isAccountPending;

  return (
    <PlaceholderScreen name="documents" title={labels.tabs.documents} leading={null} safeEdges={SAFE_EDGES}>
      <View style={{ gap: space[5] }}>
        {isAccountPending ? (
          // AI-assisted: see docs/AI_LOG.md #53 (pending notice as a status card with icon and text)
          <Card variant="status" tone="warning" style={styles.notice}>
            <Icon name="time" size={iconSize.lg} tint={color.onWarningSoft} />
            <Text testID="documents-pending-notice" style={styles.pendingNotice}>
              {labels.registration.pendingNotice}
            </Text>
          </Card>
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
          {isSubmitting ? <ActivityIndicator color={color.onPrimary} /> : null}
          <Text style={styles.submitLabel}>
            {isSubmitting ? labels.registration.documents.submitting : labels.registration.documents.submit}
          </Text>
        </Pressable>
        {submitState === 'error' ? (
          <FieldError testID="documents-error-submit" message={submitErrorMessage || labels.registration.documents.submitError} />
        ) : null}
        {submitState === 'success' ? (
          <Card variant="status" tone="success" style={styles.notice}>
            <Icon name="checkmark-circle" size={iconSize.lg} tint={color.onSuccessSoft} />
            <Text testID="documents-submit-success" style={styles.submitSuccess}>
              {labels.registration.documents.submitSuccess}
            </Text>
          </Card>
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  // AI-assisted: see docs/AI_LOG.md #53 (same look as PrimaryButton: bodyStrong label, card elevation)
  submitButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: space[2],
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[4],
    backgroundColor: color.primary,
    borderRadius: radius.md,
    ...elevation.card,
  },
  submitButtonDisabled: {
    opacity: opacity.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonPressed: {
    opacity: opacity.pressed,
  },
  submitLabel: {
    ...type.bodyStrong,
    color: color.onPrimary,
    textAlign: 'center',
    flexShrink: 1,
  },
  submitSuccess: {
    ...type.bodyStrong,
    color: color.onSuccessSoft,
    flex: 1,
    flexShrink: 1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pendingNotice: {
    ...type.bodyStrong,
    color: color.onWarningSoft,
    flex: 1,
    flexShrink: 1,
  },
});
