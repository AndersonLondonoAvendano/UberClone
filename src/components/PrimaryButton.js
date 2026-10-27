// AI-assisted: see docs/AI_LOG.md #18
// Primary action button: the single accent-filled control of a screen.
// Tokens only. Press feedback changes opacity only, so the layout never moves.

import { Pressable, StyleSheet, Text } from 'react-native';
import { color, opacity, radius, space, touch, type } from '../theme/tokens';

export function PrimaryButton({ testID, label, onPress }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
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
  },
  pressed: {
    opacity: opacity.pressed,
  },
  label: {
    ...type.label,
    color: color.onPrimary,
    textAlign: 'center',
  },
});
