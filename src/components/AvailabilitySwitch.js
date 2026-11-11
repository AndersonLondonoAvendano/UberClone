// AI-assisted: see docs/AI_LOG.md #42
// Availability switch (T-42, RF-08, DESIGN.md): the whole row is the touch target (>= touch.min)
// and the state is always written («Disponible» in success, «No disponible» in textMuted), never
// shown by color alone. accessibilityRole "switch" with the checked state for screen readers.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { borderWidth, color, opacity, radius, space, touch, type } from '../theme/tokens';

const TRACK_WIDTH = space[6] + space[5]; // 56
const THUMB_SIZE = space[5]; // 24

export function AvailabilitySwitch({ value, onValueChange, disabled = false }) {
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
        pressed && { opacity: opacity.pressed },
        disabled && { opacity: opacity.disabled },
      ]}
    >
      <View style={styles.texts}>
        <Text style={styles.label}>{labels.home.availabilityLabel}</Text>
        <Text style={[styles.state, { color: value ? color.success : color.textMuted }]}>{stateLabel}</Text>
      </View>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    backgroundColor: color.surface,
    borderColor: color.border,
    borderWidth: borderWidth.thin,
    borderRadius: radius.md,
  },
  texts: {
    flexShrink: 1,
    gap: space[1],
  },
  label: {
    ...type.label,
    color: color.text,
  },
  state: {
    ...type.title,
  },
  track: {
    width: TRACK_WIDTH,
    height: THUMB_SIZE + space[1] * 2,
    borderRadius: radius.full,
    padding: space[1],
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: color.success,
  },
  trackOff: {
    backgroundColor: color.border,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.full,
    backgroundColor: color.surface,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
});
