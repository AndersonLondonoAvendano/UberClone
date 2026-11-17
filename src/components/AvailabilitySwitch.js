// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #53
// AI-assisted: see docs/AI_LOG.md #64 (track and thumb extracted to SwitchTrack, same look and behavior)
// Availability switch (T-42, RF-08): the whole card is the touch target (>= touch.min) and the state
// is always written in a chip («Disponible» / «No disponible») next to an icon, never shown by color
// alone. accessibilityRole "switch" with the checked state for screen readers. The thumb slides with
// a transform animation (see SwitchTrack) unless the system asks to reduce motion.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { useLanguage } from '../i18n/useLanguage';
import { badgeSize, borderWidth, color, elevation, iconSize, opacity, radius, space, type } from '../theme/tokens';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { SwitchTrack } from './SwitchTrack';

export function AvailabilitySwitch({ value, onValueChange, disabled = false }) {
  useLanguage();
  const stateLabel = value ? labels.home.available : labels.home.unavailable;

  return (
    <Pressable
      testID="home-availability-switch"
      accessibilityRole="switch"
      accessibilityLabel={labels.home.availabilityLabel}
      accessibilityState={{ checked: value, disabled }}
      accessibilityHint={value ? labels.home.turnOffHint : labels.home.turnOnHint}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.row,
        value && styles.rowOn,
        pressed && { opacity: opacity.pressed },
        disabled && { opacity: opacity.disabled },
      ]}
    >
      <View style={[styles.badge, value ? styles.badgeOn : styles.badgeOff]}>
        <Icon
          name={value ? 'radio' : 'power'}
          size={iconSize.lg}
          tint={value ? color.onSuccessSoft : color.textMuted}
        />
      </View>
      <View style={styles.texts}>
        <Text style={styles.label}>{labels.home.availabilityLabel}</Text>
        <Chip label={stateLabel} tone={value ? 'success' : 'neutral'} />
      </View>
      <SwitchTrack value={value} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    backgroundColor: color.surface,
    borderColor: color.borderSubtle,
    borderWidth: borderWidth.thin,
    borderRadius: radius.lg,
    ...elevation.card,
  },
  rowOn: {
    borderColor: color.success,
    borderWidth: borderWidth.thick,
  },
  badge: {
    width: badgeSize,
    height: badgeSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  badgeOn: {
    backgroundColor: color.successSoft,
  },
  badgeOff: {
    backgroundColor: color.surfaceMuted,
  },
  texts: {
    flex: 1,
    gap: space[1],
  },
  label: {
    ...type.bodyStrong,
    color: color.text,
  },
});
