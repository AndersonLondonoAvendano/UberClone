// AI-assisted: see AI_LOG.md #51 (redesign: stronger label, clearer outline)
// AI-assisted: see AI_LOG.md #43
// Secondary action button (T-43, T-44): bordered surface, same height as PrimaryButton.
// variant 'danger' only changes the text color (destructive actions such as cancelling a trip).

import { Pressable, StyleSheet, Text } from 'react-native';
import { borderWidth, color, maxFontScale, opacity, radius, space, touch, type } from '../theme/tokens';

export function SecondaryButton({ testID, label, onPress, disabled = false, accessibilityHint, variant = 'default', style }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text maxFontSizeMultiplier={maxFontScale} style={[styles.label, variant === 'danger' && styles.danger]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touch.controlHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[3],
    borderWidth: borderWidth.thick,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  label: {
    ...type.bodyStrong,
    color: color.text,
    textAlign: 'center',
  },
  danger: {
    color: color.danger,
  },
});
