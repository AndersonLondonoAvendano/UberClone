// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #57
// "My location" button over the Home map (H-1, RF-53): icon only, so it carries its own
// accessibilityLabel. 44 x 44 touch target, tokens only. The camera move is decided by the parent.

import { Pressable, StyleSheet } from 'react-native';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { color, elevation, iconSize, opacity, radius, touch } from '../../theme/tokens';
import { Icon } from '../Icon';

export function MyLocationButton({ onPress, style }) {
  useLanguage();
  return (
    <Pressable
      testID="home-my-location"
      accessibilityRole="button"
      accessibilityLabel={labels.a11y.myLocation}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Icon name="locate" size={iconSize.lg} tint={color.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    ...elevation.card,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
