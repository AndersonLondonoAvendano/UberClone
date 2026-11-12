// AI-assisted: see docs/AI_LOG.md #27
// AI-assisted: see docs/AI_LOG.md #34
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #55 (license, SOAT and technical review sections, RF-41)
// AI-assisted: see docs/AI_LOG.md #60 (payments email label and helper text)
// Documents tab: license (number, photo, expiry), SOAT (photo, expiry), technical review (photo,
// expiry, or the reason it is not required), the Mercado Pago email, the terms checkbox with the
// commission percentage, and the "Enviar registro" button that submits the whole form.

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { CheckboxField } from '../../components/registration/CheckboxField';
import { DateField } from '../../components/registration/DateField';
import { FieldError } from '../../components/registration/FieldError';
import { PhotoField } from '../../components/registration/PhotoField';
import { TextField } from '../../components/registration/TextField';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { useRegistrationForm } from '../../context/RegistrationFormContext';
import { borderWidth, color, elevation, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { commissionPercent } from '../../utils/fare';
import { isValidEmail, isTermsAccepted } from '../../utils/validators';

const SAFE_EDGES = ['top'];
const FIELDS = labels.registration.documents.fields;
const SECTIONS = labels.registration.documents.sections;
// AI-assisted: see docs/AI_LOG.md #60 (header shows the step, not the tab name that the bar already shows)
const STEP_TITLE = labels.registrationFlow.stepOf.replace('{n}', '3').replace('{total}', '3');

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
    documentFields,
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
  // AI-assisted: see docs/AI_LOG.md #55
  // Same rule as the other tabs: an error shows once the field was touched or the tab was visited.
  const documentErrorFor = (key) => (documents.touched[key] || showErrors ? documentFields.errors[key] : null);
  const technicalReview = documentFields.technicalReview;
  const isSubmitting = submitState === 'submitting';
  // The account stays pending until an admin approves it elsewhere, so the submit action must
  // not be reachable again (no edit, no re-send) while it is pending.
  const canSubmit = isRegistrationValid && !isSubmitting && !isAccountPending;

  return (
    <PlaceholderScreen name="documents" title={STEP_TITLE} leading={null} safeEdges={SAFE_EDGES}>
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

        {/* AI-assisted: see docs/AI_LOG.md #55 */}
        <Card style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {SECTIONS.license}
          </Text>
          <TextField
            testID="documents-field-license-number"
            errorTestID="documents-error-license-number"
            label={FIELDS.licenseNumber.label}
            value={documents.licenseNumber}
            onChangeText={(value) => setDocumentsField('licenseNumber', value)}
            onBlur={() => touchDocumentsField('licenseNumber')}
            maxLength={20}
            errorMessage={documentErrorFor('licenseNumber')}
            announceError
            disabled={isLocked}
          />
          <PhotoField
            testID="documents-field-license-photo"
            errorTestID="documents-error-license-photo"
            label={FIELDS.licensePhotoUrl.label}
            value={documents.licensePhotoUrl}
            onChange={(url) => {
              setDocumentsField('licensePhotoUrl', url);
              touchDocumentsField('licensePhotoUrl');
            }}
            errorMessage={documentErrorFor('licensePhotoUrl')}
            announceError
            disabled={isLocked}
          />
          <DateField
            testID="documents-field-license-expiry"
            errorTestID="documents-error-license-expiry"
            label={FIELDS.licenseExpiresAt.label}
            value={documents.licenseExpiresAt}
            onChange={(date) => {
              setDocumentsField('licenseExpiresAt', date);
              touchDocumentsField('licenseExpiresAt');
            }}
            errorMessage={documentErrorFor('licenseExpiresAt')}
            announceError
            disabled={isLocked}
          />
        </Card>

        <Card style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {SECTIONS.soat}
          </Text>
          <PhotoField
            testID="documents-field-soat-photo"
            errorTestID="documents-error-soat-photo"
            label={FIELDS.soatPhotoUrl.label}
            value={documents.soatPhotoUrl}
            onChange={(url) => {
              setDocumentsField('soatPhotoUrl', url);
              touchDocumentsField('soatPhotoUrl');
            }}
            errorMessage={documentErrorFor('soatPhotoUrl')}
            announceError
            disabled={isLocked}
          />
          <DateField
            testID="documents-field-soat-expiry"
            errorTestID="documents-error-soat-expiry"
            label={FIELDS.soatExpiresAt.label}
            value={documents.soatExpiresAt}
            onChange={(date) => {
              setDocumentsField('soatExpiresAt', date);
              touchDocumentsField('soatExpiresAt');
            }}
            errorMessage={documentErrorFor('soatExpiresAt')}
            announceError
            disabled={isLocked}
          />
        </Card>

        <Card style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {SECTIONS.technicalReview}
          </Text>
          {technicalReview.required ? (
            <>
              <PhotoField
                testID="documents-field-technical-review-photo"
                errorTestID="documents-error-technical-review-photo"
                label={FIELDS.technicalReviewPhotoUrl.label}
                value={documents.technicalReviewPhotoUrl}
                onChange={(url) => {
                  setDocumentsField('technicalReviewPhotoUrl', url);
                  touchDocumentsField('technicalReviewPhotoUrl');
                }}
                errorMessage={documentErrorFor('technicalReviewPhotoUrl')}
                announceError
                disabled={isLocked}
              />
              <DateField
                testID="documents-field-technical-review-expiry"
                errorTestID="documents-error-technical-review-expiry"
                label={FIELDS.technicalReviewExpiresAt.label}
                value={documents.technicalReviewExpiresAt}
                onChange={(date) => {
                  setDocumentsField('technicalReviewExpiresAt', date);
                  touchDocumentsField('technicalReviewExpiresAt');
                }}
                errorMessage={documentErrorFor('technicalReviewExpiresAt')}
                announceError
                disabled={isLocked}
              />
            </>
          ) : (
            <View style={styles.reasonRow}>
              <Icon name="information-circle" size={iconSize.lg} tint={color.onPrimarySoft} />
              <Text testID="documents-technical-review-reason" style={styles.reasonText}>
                {technicalReview.reason}
              </Text>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {SECTIONS.payments}
          </Text>
          <TextField
            testID="documents-field-mp-email"
            errorTestID="documents-error-mp-email"
            label={FIELDS.mercadoPagoEmail.label}
            helperText={FIELDS.mercadoPagoEmail.help}
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
        </Card>

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
  // AI-assisted: see docs/AI_LOG.md #55
  section: {
    gap: space[4],
  },
  sectionTitle: {
    ...type.heading,
    color: color.text,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    backgroundColor: color.primarySoft,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: color.borderSubtle,
    padding: space[3],
  },
  reasonText: {
    ...type.body,
    color: color.onPrimarySoft,
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
