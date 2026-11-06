// AI-assisted: see docs/AI_LOG.md #14
// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #35
// AI-assisted: see docs/AI_LOG.md #38
// Placeholder screen: safe-area frame, header, provisional state selector and content area.
// The selector (force-content|loading|empty|error) is provisional until each screen has real data,
// and only renders while SHOW_DEV_TOOLS is on. With it off, kind never leaves INITIAL_KIND
// ('content'), so the real content below always renders and never depends on this panel.
// It owns the top/bottom safe area so screens inside navigators with hidden headers clear the status bar.
//
// Keyboard avoidance (shared by every tab that uses this wrapper): wraps the ScrollView in a
// KeyboardAvoidingView so the visible area actually shrinks when the keyboard opens (the standard
// React Native pattern), which also lets the native scroll-into-view behavior reach a focused
// field. On top of that, a Keyboard listener tracks the live keyboard height and adds it as extra
// bottom padding to the scroll content, so the last field and the submit button always have scroll
// room above the keyboard even if the resize alone leaves them short. Android only ever fires
// keyboardDidShow/keyboardDidHide (no "will" variants), so the listener picks the event names by
// platform instead of assuming the iOS names exist everywhere.

import { useCallback, useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { labels } from '../constants/labels';
import { SHOW_DEV_TOOLS } from '../constants/devTools';
import { color, space, touch, type } from '../theme/tokens';
import { ScreenHeader } from './ScreenHeader';
import { ScreenState } from './ScreenState';

const KINDS = ['content', 'loading', 'empty', 'error'];
const INITIAL_KIND = 'content';
const DEFAULT_SAFE_EDGES = ['top', 'bottom'];

// safeEdges: edges the screen keeps clear of system bars. Screens above a tab bar pass ['top'].
export function PlaceholderScreen({
  name,
  title,
  leading,
  onLeadingPress,
  safeEdges = DEFAULT_SAFE_EDGES,
  children,
}) {
  const [kind, setKind] = useState(INITIAL_KIND);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Local retry: shows the loading state again. It does not touch the account context on purpose,
  // so retrying here never sends the whole app back to its loading screen.
  const handleRetry = useCallback(() => {
    setKind('loading');
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView testID={`screen-${name}`} edges={safeEdges} style={styles.screen}>
      <ScreenHeader title={title} leading={leading} onLeadingPress={onLeadingPress} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: space[4] + keyboardHeight }]}
          keyboardShouldPersistTaps="handled"
        >
          {SHOW_DEV_TOOLS ? (
            <View style={styles.group}>
              <Text style={styles.legend}>{labels.forceState.legend}</Text>
              <View style={styles.row}>
                {KINDS.map((option) => {
                  const selected = option === kind;
                  return (
                    <Pressable
                      key={option}
                      testID={`${name}-force-${option}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setKind(option)}
                      style={styles.option}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {labels.forceState[option]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
          {kind === 'content' ? (
            children || <Text style={styles.body}>{labels.placeholder.body}</Text>
          ) : (
            <ScreenState kind={kind} onRetry={handleRetry} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  keyboardAvoider: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    gap: space[5],
  },
  group: {
    gap: space[2],
  },
  legend: {
    ...type.label,
    color: color.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: touch.gap,
  },
  option: {
    minHeight: touch.min,
    minWidth: touch.min,
    justifyContent: 'center',
    paddingHorizontal: space[3],
  },
  optionText: {
    ...type.body,
    color: color.textMuted,
  },
  optionTextSelected: {
    color: color.text,
    fontWeight: type.title.fontWeight,
    textDecorationLine: 'underline',
  },
  body: {
    ...type.body,
    color: color.textMuted,
  },
});
