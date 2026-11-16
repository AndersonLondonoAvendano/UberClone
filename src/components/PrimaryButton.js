// AI-assisted: see docs/AI_LOG.md #51 (redesign: stronger label, clearer outline)
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #43 (optional disabled state and accessibility hint)
// AI-assisted: see docs/AI_LOG.md #64 (quietDisabled: legible inactive look; busy state; font scale cap)
// Primary action button: the single accent-filled control of a screen.
// Tokens only. Press feedback changes opacity only, so the layout never moves.

import { Pressable, StyleSheet, Text } from 'react-native';
import { borderWidth, color, elevation, maxFontScale, opacity, radius, space, touch, type } from '../theme/tokens';

// quietDisabled: when disabled, draw a legible inactive button (muted surface, outline, muted text)
// instead of the half-transparent accent one. Other uses keep the default look.
export function PrimaryButton({ testID, label, onPress, disabled = false, accessibilityHint, quietDisabled = false, busy = false }) {
  const quiet = disabled && quietDisabled;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && (quiet ? styles.quiet : styles.disabled),
      ]}
    >
      <Text maxFontSizeMultiplier={maxFontScale} style={[styles.label, quiet && styles.quietLabel]}>
        {label}
      </Text>
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
  quiet: {
    backgroundColor: color.surfaceMuted,
    borderWidth: borderWidth.thin,
    borderColor: color.borderSubtle,
    ...elevation.none,
    shadowOpacity: 0,
    elevation: 0,
  },
  quietLabel: {
    color: color.textMuted,
  },
  label: {
    ...type.bodyStrong,
    color: color.onPrimary,
    textAlign: 'center',
  },
});
