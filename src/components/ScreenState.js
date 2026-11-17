// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #54 (orphan comment removed)
// AI-assisted: see AI_LOG.md #13
// AI-assisted: see AI_LOG.md #14
// AI-assisted: see AI_LOG.md #51 (redesign: skeleton loading, framed empty and error cards)
// Remote-data screen states: loading (pulsing skeleton blocks), empty (framed card), error (soft red
// card with retry button). Tokens only; texts come from labels.js. The pulse respects reduce-motion.

import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { useLanguage } from '../i18n/useLanguage';
import { borderWidth, color, elevation, iconSize, motion, opacity, radius, space, touch, type } from '../theme/tokens';
import { Icon } from './Icon';

// Pulsing placeholder block. Static when the system asks to reduce motion.
export function SkeletonBlock({ height = space[5], width = '100%', style }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduce(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduce) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: motion.slow * 2, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: motion.slow * 2, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, pulse]);

  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[styles.skeleton, { height, width, opacity: pulse }, style]}
    />
  );
}

// kind: 'loading' | 'empty' | 'error'.
// Error without onRetry: the retry button is NOT rendered (a button that does nothing misleads);
// the error title and message still show.
// AI-assisted: see AI_LOG.md #50 (optional title/message replace the generic copy of that kind)
export function ScreenState({ kind, onRetry, title, message }) {
  useLanguage();
  const base = labels.states[kind];
  if (!base) return null;
  const copy = { title: title ?? base.title, message: message ?? base.message };

  const isLoading = kind === 'loading';
  const isEmpty = kind === 'empty';
  const isError = kind === 'error';

  return (
    <View
      testID={`state-${kind}`}
      accessibilityLiveRegion="polite"
      accessible={isLoading ? true : undefined}
      accessibilityLabel={isLoading ? labels.states.loading.title : undefined}
      style={[styles.root, isLoading && styles.rootLoading, isEmpty && styles.rootEmpty, isError && styles.rootError]}
    >
      {isLoading ? (
        <View style={styles.skeletons}>
          <SkeletonBlock height={space[6]} width="60%" />
          <SkeletonBlock height={space[7]} />
          <SkeletonBlock height={space[7]} />
        </View>
      ) : null}
      {isEmpty ? (
        <View style={styles.emptyIcon} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Icon name="file-tray-outline" size={iconSize.lg} tint={color.textMuted} />
        </View>
      ) : null}
      {isError ? <Icon name="alert-circle" size={iconSize.lg} tint={color.onDangerSoft} /> : null}
      <Text accessibilityRole="header" style={[styles.title, isError && styles.titleError]}>
        {copy.title}
      </Text>
      <Text style={[styles.message, isError && styles.messageError]}>{copy.message}</Text>
      {isError && onRetry ? (
        <Pressable
          testID="btn-retry"
          accessibilityRole="button"
          accessibilityLabel={labels.actions.retry}
          onPress={onRetry}
          style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
        >
          <Text style={styles.retryText}>{labels.actions.retry}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space[2],
    paddingVertical: space[5],
  },
  rootLoading: {
    gap: space[4],
  },
  rootEmpty: {
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: color.borderSubtle,
    paddingHorizontal: space[4],
    paddingVertical: space[5],
    ...elevation.card,
  },
  rootError: {
    backgroundColor: color.dangerSoft,
    borderRadius: radius.lg,
    paddingHorizontal: space[4],
  },
  skeletons: {
    gap: space[3],
  },
  skeleton: {
    borderRadius: radius.md,
    backgroundColor: color.skeleton,
  },
  emptyIcon: {
    width: space[7],
    height: space[7],
    borderRadius: radius.full,
    borderWidth: borderWidth.thick,
    borderColor: color.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  title: {
    ...type.title,
    color: color.text,
  },
  titleError: {
    color: color.onDangerSoft,
  },
  message: {
    ...type.body,
    color: color.textMuted,
  },
  messageError: {
    color: color.text,
  },
  retry: {
    minHeight: touch.controlHeight,
    marginTop: space[3],
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[4],
    backgroundColor: color.primary,
    borderRadius: radius.md,
  },
  retryPressed: {
    // Press feedback changes opacity only, so the layout never moves.
    opacity: opacity.pressed,
  },
  retryText: {
    ...type.bodyStrong,
    color: color.onPrimary,
    textAlign: 'center',
  },
});
