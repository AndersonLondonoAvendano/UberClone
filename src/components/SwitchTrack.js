// AI-assisted: see AI_LOG.md #64
// Track and thumb of a switch, shared by AvailabilitySwitch and the notifications row (F-01). Purely
// visual: the parent Pressable owns the touch target and the accessibility role. The thumb slides with a
// transform animation unless the system asks to reduce motion. Tokens only.

import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { color, motion, radius, space } from '../theme/tokens';

const TRACK_PADDING = space[1];
const THUMB_SIZE = space[5]; // 24
const TRACK_WIDTH = space[6] + space[5]; // 56
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

export function SwitchTrack({ value }) {
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
    <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
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
