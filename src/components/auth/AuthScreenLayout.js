// AI-assisted: see docs/AI_LOG.md #54
// Frame shared by the three authentication screens: safe area, header, and a keyboard-aware scroll
// area so the focused field, its error and the main button stay above the keyboard. The content
// grows in height with the text size (no fixed heights). Same keyboard pattern as PlaceholderScreen.

import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../ScreenHeader';
import { color, space } from '../../theme/tokens';

export function AuthScreenLayout({ testID, title, leading = null, onLeadingPress, children }) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    <SafeAreaView testID={testID} style={styles.screen}>
      <ScreenHeader title={title} leading={leading} onLeadingPress={onLeadingPress} />
      <KeyboardAvoidingView style={styles.avoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: space[4] + keyboardHeight }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
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
  avoider: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    gap: space[5],
  },
});
