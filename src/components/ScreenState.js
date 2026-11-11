// AI-assisted: see docs/AI_LOG.md #13
// AI-assisted: see docs/AI_LOG.md #14
// Remote-data screen states: loading (activity indicator), empty (framed block), error (retry button).
// Tokens only; texts come from labels.js. No shadows, gradients, icons or own animations.

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { color, opacity, radius, space, touch, type } from '../theme/tokens';

// kind: 'loading' | 'empty' | 'error'.
// Error without onRetry: the retry button is NOT rendered (a button that does nothing misleads);
// the error title and message still show.
// AI-assisted: see docs/AI_LOG.md #50 (optional title/message replace the generic copy of that kind)
export function ScreenState({ kind, onRetry, title, message }) {
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
      accessibilityLabel={isLoading ? labels.states.loading.title : undefined}
      style={[styles.root, isLoading && styles.rootLoading, isEmpty && styles.rootEmpty]}
    >
      {isLoading ? <ActivityIndicator size="large" color={color.textMuted} /> : null}
      <Text style={[styles.title, isError && styles.titleError]}>{copy.title}</Text>
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
    alignItems: 'center',
    gap: space[3],
  },
  rootEmpty: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    paddingVertical: space[5],
  },
  title: {
    ...type.title,
    color: color.text,
  },
  titleError: {
    color: color.danger,
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
    ...type.label,
    color: color.onPrimary,
    textAlign: 'center',
  },
});
