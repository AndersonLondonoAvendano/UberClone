// AI-assisted: see docs/AI_LOG.md #54
// Password-recovery screen (RF-35). The email lives only in this component's state and is cleared
// when the screen loses focus. The neutral message is identical whether the email has an account or
// not (mapAuthError('reset', ...)); only network and rate-limit failures differ. Nothing is logged.

import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthFormError } from '../../components/auth/AuthFormError';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextField } from '../../components/registration/TextField';
import { labels } from '../../constants/labels';
import { sendPasswordReset } from '../../services/authService';
import { AUTH_ERROR_KIND, mapAuthError } from '../../utils/authErrors';
import { validateEmail } from '../../utils/authValidators';
import { color, type } from '../../theme/tokens';

const TEXT = labels.auth;

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const emailRef = useRef(null);
  const pendingFocusRef = useRef(false);

  // Clears everything when the screen loses focus (or unmounts).
  useFocusEffect(
    useCallback(
      () => () => {
        setEmail('');
        setEmailError(null);
        setNotice(null);
        setFormError(null);
      },
      [],
    ),
  );

  // The field is disabled while sending; a server-side field error is focused once it is editable again.
  useEffect(() => {
    if (!submitting && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      emailRef.current?.focus();
    }
  }, [submitting]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    const code = validateEmail(email);
    setNotice(null);
    setFormError(null);
    if (code) {
      setEmailError(TEXT.fieldErrors[code]);
      emailRef.current?.focus();
      return;
    }
    setEmailError(null);
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setNotice(mapAuthError('reset', undefined).message);
    } catch (error) {
      const mapped = mapAuthError('reset', error);
      if (mapped.kind === AUTH_ERROR_KIND.NEUTRAL) {
        setNotice(mapped.message);
      } else if (mapped.field) {
        setEmailError(mapped.message);
        pendingFocusRef.current = true;
      } else {
        setFormError(mapped.message);
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [email]);

  return (
    <AuthScreenLayout
      testID="screen-forgot-password"
      title={TEXT.reset.title}
      leading="back"
      onLeadingPress={() => navigation.goBack()}
    >
      <Card style={styles.card}>
        <Text style={styles.intro}>{TEXT.reset.intro}</Text>
        <AuthFormError testID="forgot-password-error-form" message={formError} />
        <AuthFormError testID="forgot-password-notice" message={notice} tone="success" />
        <TextField
          testID="forgot-password-field-email"
          errorTestID="forgot-password-error-email"
          label={TEXT.fields.email.label}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          errorMessage={emailError}
          disabled={submitting}
          inputRef={emailRef}
          announceError
          inputProps={{
            autoCapitalize: 'none',
            autoCorrect: false,
            autoComplete: 'email',
            textContentType: 'emailAddress',
            placeholder: TEXT.fields.email.placeholder,
            returnKeyType: 'done',
            onSubmitEditing: handleSubmit,
          }}
        />
        <PrimaryButton
          testID="forgot-submit"
          label={submitting ? TEXT.reset.submitting : TEXT.reset.submit}
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityHint={submitting ? TEXT.a11y.submitting : undefined}
        />
      </Card>
      <SecondaryButton
        testID="forgot-link-login"
        label={TEXT.reset.backLink}
        onPress={() => navigation.navigate('Login')}
        disabled={submitting}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
  },
  intro: {
    ...type.body,
    color: color.text,
  },
});
