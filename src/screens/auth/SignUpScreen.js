// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #54
// AI-assisted: see AI_LOG.md #60 (presentation redesign: brand band, icon fields, text link)
// Create-account screen (RF-33). Email, password and confirmation live only in this component's
// state and are cleared when the screen loses focus and after success. The password requirements
// are always visible and their state is shown with icon + text. After success the auth gate (T-69)
// moves the driver to the registration. Nothing is logged.

import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthField } from '../../components/auth/AuthField';
import { AuthFormError } from '../../components/auth/AuthFormError';
import { AuthLink } from '../../components/auth/AuthLink';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { PasswordField } from '../../components/auth/PasswordField';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { signUpWithEmail } from '../../services/authService';
import { mapAuthError } from '../../utils/authErrors';
import { firstInvalidField, passwordRequirements, validateSignUp } from '../../utils/authValidators';
import { color, iconSize, radius, space, type } from '../../theme/tokens';

const TEXT = labels.auth;
const FIELD_ORDER = ['email', 'password', 'confirmation'];

export function SignUpScreen({ navigation }) {
  useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const emailRef = useRef(null);
  const pendingFocusRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmationRef = useRef(null);

  // Clears everything when the screen loses focus (or unmounts).
  useFocusEffect(
    useCallback(
      () => () => {
        setEmail('');
        setPassword('');
        setConfirmation('');
        setPasswordVisible(false);
        setFieldErrors({});
        setFormError(null);
      },
      [],
    ),
  );

  const focusField = (field) => {
    const target = field === 'email' ? emailRef : field === 'password' ? passwordRef : confirmationRef;
    target.current?.focus();
  };

  // Fields are disabled while sending; a server-side field error is focused once they are editable again.
  useEffect(() => {
    if (!submitting && pendingFocusRef.current) {
      const field = pendingFocusRef.current;
      pendingFocusRef.current = null;
      focusField(field);
    }
  }, [submitting]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    const codes = validateSignUp({ email, password, confirmation });
    const invalid = firstInvalidField(codes, FIELD_ORDER);
    setFormError(null);
    if (invalid) {
      const messages = {};
      Object.keys(codes).forEach((key) => {
        messages[key] = TEXT.fieldErrors[codes[key]];
      });
      setFieldErrors(messages);
      focusField(invalid);
      return;
    }
    setFieldErrors({});
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await signUpWithEmail(email.trim(), password);
      setPassword('');
      setConfirmation('');
    } catch (error) {
      const mapped = mapAuthError('signup', error);
      if (mapped.field) {
        setFieldErrors({ [mapped.field]: mapped.message });
        pendingFocusRef.current = mapped.field;
      } else {
        setFormError(mapped.message);
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [email, password, confirmation]);

  const requirements = passwordRequirements(password);

  return (
    <AuthScreenLayout testID="screen-signup">
      <Card style={styles.card}>
        <Text style={styles.title}>{TEXT.signUp.title}</Text>
        <AuthFormError testID="signup-error-form" message={formError} />
        <AuthField
          testID="signup-field-email"
          errorTestID="signup-error-email"
          label={TEXT.fields.email.label}
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          errorMessage={fieldErrors.email}
          disabled={submitting}
          inputRef={emailRef}
          inputProps={{
            autoCapitalize: 'none',
            autoCorrect: false,
            autoComplete: 'email',
            textContentType: 'emailAddress',
            placeholder: TEXT.fields.email.placeholder,
            returnKeyType: 'next',
            onSubmitEditing: () => passwordRef.current?.focus(),
          }}
        />
        <PasswordField
          testID="signup-field-password"
          errorTestID="signup-error-password"
          toggleTestID="signup-toggle-password"
          label={TEXT.fields.password.label}
          value={password}
          onChangeText={setPassword}
          errorMessage={fieldErrors.password}
          visible={passwordVisible}
          onToggleVisible={() => setPasswordVisible((current) => !current)}
          isNewPassword
          disabled={submitting}
          inputRef={passwordRef}
          returnKeyType="next"
          onSubmitEditing={() => confirmationRef.current?.focus()}
        />
        <View testID="signup-password-requirements" style={styles.requirements}>
          <Text style={styles.requirementsTitle}>{TEXT.passwordHelp.title}</Text>
          {requirements.map((requirement) => (
            <View key={requirement.id} style={styles.requirementRow}>
              <Icon
                name={requirement.met ? 'checkmark-circle' : 'ellipse-outline'}
                size={iconSize.md}
                tint={requirement.met ? color.success : color.textMuted}
              />
              <Text style={styles.requirementText}>{TEXT.passwordHelp[requirement.id]}</Text>
              <Text
                testID={`signup-requirement-${requirement.id}`}
                style={[styles.requirementState, requirement.met && styles.requirementMet]}
              >
                {requirement.met ? TEXT.passwordHelp.met : TEXT.passwordHelp.unmet}
              </Text>
            </View>
          ))}
        </View>
        <PasswordField
          testID="signup-field-confirmation"
          errorTestID="signup-error-confirmation"
          label={TEXT.fields.confirmation.label}
          value={confirmation}
          onChangeText={setConfirmation}
          errorMessage={fieldErrors.confirmation}
          visible={passwordVisible}
          isNewPassword
          disabled={submitting}
          inputRef={confirmationRef}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        <PrimaryButton
          testID="signup-submit"
          label={submitting ? TEXT.signUp.submitting : TEXT.signUp.submit}
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityHint={submitting ? TEXT.a11y.submitting : undefined}
        />
      </Card>
      <AuthLink
        testID="signup-link-login"
        label={TEXT.signUp.loginLink}
        onPress={() => navigation.navigate('Login')}
        disabled={submitting}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    padding: space[5],
    gap: space[4],
  },
  title: {
    ...type.display,
    color: color.text,
  },
  requirements: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
  },
  requirementsTitle: {
    ...type.label,
    color: color.text,
  },
  requirementRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space[2],
  },
  requirementText: {
    ...type.small,
    color: color.text,
    flexShrink: 1,
  },
  requirementState: {
    ...type.label,
    color: color.textMuted,
  },
  requirementMet: {
    color: color.onSuccessSoft,
  },
});
