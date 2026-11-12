// AI-assisted: see docs/AI_LOG.md #54
// Sign-in screen (RF-34). Email and password live only in this component's state and are cleared
// when the screen loses focus and after a successful sign-in. Nothing is logged. The same generic
// message is shown for every credential failure (mapAuthError).

import { useCallback, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthFormError } from '../../components/auth/AuthFormError';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { PasswordField } from '../../components/auth/PasswordField';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextField } from '../../components/registration/TextField';
import { labels } from '../../constants/labels';
import { signInWithEmail } from '../../services/authService';
import { mapAuthError } from '../../utils/authErrors';
import { firstInvalidField, validateLogin } from '../../utils/authValidators';

const TEXT = labels.auth;
const FIELD_ORDER = ['email', 'password'];

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Clears everything when the screen loses focus (or unmounts).
  useFocusEffect(
    useCallback(
      () => () => {
        setEmail('');
        setPassword('');
        setPasswordVisible(false);
        setFieldErrors({});
        setFormError(null);
      },
      [],
    ),
  );

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    const codes = validateLogin({ email, password });
    const invalid = firstInvalidField(codes, FIELD_ORDER);
    setFormError(null);
    if (invalid) {
      const messages = {};
      Object.keys(codes).forEach((key) => {
        messages[key] = TEXT.fieldErrors[codes[key]];
      });
      setFieldErrors(messages);
      (invalid === 'email' ? emailRef : passwordRef).current?.focus();
      return;
    }
    setFieldErrors({});
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      setPassword('');
    } catch (error) {
      setFormError(mapAuthError('login', error).message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [email, password]);

  return (
    <AuthScreenLayout testID="screen-login" title={TEXT.login.title}>
      <Card style={styles.card}>
        <AuthFormError testID="login-error-form" message={formError} />
        <TextField
          testID="login-field-email"
          errorTestID="login-error-email"
          label={TEXT.fields.email.label}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          errorMessage={fieldErrors.email}
          disabled={submitting}
          inputRef={emailRef}
          announceError
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
          testID="login-field-password"
          errorTestID="login-error-password"
          toggleTestID="login-toggle-password"
          label={TEXT.fields.password.label}
          value={password}
          onChangeText={setPassword}
          errorMessage={fieldErrors.password}
          visible={passwordVisible}
          onToggleVisible={() => setPasswordVisible((current) => !current)}
          disabled={submitting}
          inputRef={passwordRef}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        <PrimaryButton
          testID="login-submit"
          label={submitting ? TEXT.login.submitting : TEXT.login.submit}
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityHint={submitting ? TEXT.a11y.submitting : undefined}
        />
      </Card>
      <SecondaryButton
        testID="login-link-forgot"
        label={TEXT.login.forgotLink}
        onPress={() => navigation.navigate('ForgotPassword')}
        disabled={submitting}
      />
      <SecondaryButton
        testID="login-link-signup"
        label={TEXT.login.signUpLink}
        onPress={() => navigation.navigate('SignUp')}
        disabled={submitting}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
  },
});
