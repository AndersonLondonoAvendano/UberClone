// AI-assisted: see docs/AI_LOG.md #42
// AI-assisted: see docs/AI_LOG.md #53
// Availability switch (T-42, RF-08): the whole card is the touch target (>= touch.min) and the state
// is always written in a chip («Disponible» / «No disponible») next to an icon, never shown by color
// alone. accessibilityRole "switch" with the checked state for screen readers. The thumb slides with
// a transform animation unless the system asks to reduce motion.

import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { badgeSize, borderWidth, color, elevation, iconSize, motion, opacity, radius, space, type } from '../theme/tokens';
import { Chip } from './Chip';
import { Icon } from './Icon';

const TRACK_PADDING = space[1];
const THUMB_SIZE = space[5]; // 24
const TRACK_WIDTH = space[6] + space[5]; // 56
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

export function AvailabilitySwitch({ value, onValueChange, disabled = false }) {
  const stateLabel = value ? labels.home.available : labels.home.unavailable;
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    let cancelled = false;
    let animation = null;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          position.setValue(value ? 1 : 0);
          return;
        }
        animation = Animated.timing(position, { toValue: value ? 1 : 0, duration: motion.fast, useNativeDriver: true });
        animation.start();
      });
    return () => {
      cancelled = true;
      if (animation) animation.stop();
    };
  }, [value, position]);

  const translateX = position.interpolate({ inputRange: [0, 1], outputRange: [0, THUMB_TRAVEL] });

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
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </View>
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
  track: {
    width: TRACK_WIDTH,
    height: THUMB_SIZE + TRACK_PADDING * 2,
    borderRadius: radius.full,
    padding: TRACK_PADDING,
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
});
