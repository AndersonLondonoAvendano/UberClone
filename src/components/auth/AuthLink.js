// AI-assisted: see docs/AI_LOG.md #60
// Secondary text link of the authentication screens (forgot password, create account, back to sign in).
// Lighter than the primary button on purpose: no box, brand colour and underline. The touch target is at
// least 48 dp high and grows with the text size.

import { Pressable, StyleSheet, Text } from 'react-native';
import { color, opacity, space, touch, type } from '../../theme/tokens';

export function AuthLink({ testID, label, onPress, disabled = false, style }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.link, style, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    minHeight: touch.controlHeight,
    minWidth: touch.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[3],
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  label: {
    ...type.bodyStrong,
    color: color.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
