// AI-assisted: see docs/AI_LOG.md #51 (redesign: stronger label, clearer outline)
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #43 (optional disabled state and accessibility hint)
// Primary action button: the single accent-filled control of a screen.
// Tokens only. Press feedback changes opacity only, so the layout never moves.

import { Pressable, StyleSheet, Text } from 'react-native';
import { color, elevation, opacity, radius, space, touch, type } from '../theme/tokens';

export function PrimaryButton({ testID, label, onPress, disabled = false, accessibilityHint }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[4],
    backgroundColor: color.primary,
    borderRadius: radius.md,
    ...elevation.card,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
    ...elevation.none,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    ...type.bodyStrong,
    color: color.onPrimary,
    textAlign: 'center',
  },
});
