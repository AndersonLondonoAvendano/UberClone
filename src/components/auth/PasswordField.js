// AI-assisted: see docs/AI_LOG.md #54
// Password field of the authentication forms: a TextField with the text hidden and, when the screen
// passes onToggleVisible, a show/hide button (role button, label that tells the state, >= 44 x 44).
// The password lives only in the state of the screen that renders this field.

import { Pressable, StyleSheet, Text } from 'react-native';
import { Icon } from '../Icon';
import { TextField } from '../registration/TextField';
import { labels } from '../../constants/labels';
import { color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';

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

  return (
    <>
      <TextField
        testID={testID}
        errorTestID={errorTestID}
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        errorMessage={errorMessage}
        disabled={disabled}
        inputRef={inputRef}
        announceError
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
      {onToggleVisible ? (
        <Pressable
          testID={toggleTestID}
          accessibilityRole="button"
          accessibilityLabel={toggleLabel}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onToggleVisible}
          style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={iconSize.lg} tint={color.onPrimarySoft} />
          <Text style={styles.toggleText}>{toggleLabel}</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  toggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: touch.min,
    minWidth: touch.min,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  toggleText: {
    ...type.label,
    color: color.onPrimarySoft,
    flexShrink: 1,
  },
});
