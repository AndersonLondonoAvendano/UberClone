// AI-assisted: see docs/AI_LOG.md #54
// AI-assisted: see docs/AI_LOG.md #60 (lock icon and the show/hide button inside the field)
// Password field of the authentication forms: an AuthField with the text hidden and, when the screen
// passes onToggleVisible, an eye button INSIDE the field (role button, label that tells the state,
// >= 48 x 48). The password lives only in the state of the screen that renders this field.

import { Pressable, StyleSheet } from 'react-native';
import { AuthField } from './AuthField';
import { Icon } from '../Icon';
import { labels } from '../../constants/labels';
import { color, iconSize, opacity, radius, touch } from '../../theme/tokens';

const A11Y = labels.auth.a11y;

export function PasswordField({
  testID,
  errorTestID,
  toggleTestID,
  label,
  value,
  onChangeText,
  onBlur,
  errorMessage,
  visible = false,
  onToggleVisible,
  isNewPassword = false,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  disabled = false,
}) {
  const toggleLabel = visible ? A11Y.hidePassword : A11Y.showPassword;

  const toggle = onToggleVisible ? (
    <Pressable
      testID={toggleTestID}
      accessibilityRole="button"
      accessibilityLabel={toggleLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onToggleVisible}
      style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
    >
      <Icon name={visible ? 'eye-off' : 'eye'} size={iconSize.lg} tint={color.textMuted} />
    </Pressable>
  ) : null;

  return (
    <AuthField
      testID={testID}
      errorTestID={errorTestID}
      label={label}
      icon="lock-closed"
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      errorMessage={errorMessage}
      disabled={disabled}
      inputRef={inputRef}
      trailing={toggle}
      inputProps={{
        secureTextEntry: !visible,
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: isNewPassword ? 'new-password' : 'current-password',
        textContentType: isNewPassword ? 'newPassword' : 'password',
        returnKeyType,
        onSubmitEditing,
      }}
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touch.controlHeight,
    minWidth: touch.controlHeight,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
