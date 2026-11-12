// AI-assisted: see docs/AI_LOG.md #54
// AI-assisted: see docs/AI_LOG.md #60 (no header: brand band, overlapping form card, centred content)
// Frame shared by the three authentication screens: the brand band (AuthBackdrop) under the status bar
// and a keyboard-aware scroll area so the focused field, its error and the main button stay above the
// keyboard. The children (card and links) are centred and overlap the lower edge of the band. The
// content grows in height with the text size (no fixed heights). Same keyboard pattern as PlaceholderScreen.

import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthBackdrop } from './AuthBackdrop';
import { color, space } from '../../theme/tokens';

export function AuthScreenLayout({ testID, children }) {
  const insets = useSafeAreaInsets();
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
    <View testID={testID} style={styles.screen}>
      <KeyboardAvoidingView style={styles.avoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + space[4] + keyboardHeight }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthBackdrop topInset={insets.top} />
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  scroll: {
    flexGrow: 1,
  },
  // The negative margin pulls the card over the curved band; the band gives it room at the bottom.
  content: {
    marginTop: -(space[7] + space[3]),
    paddingHorizontal: space[4],
    gap: space[3],
  },
});
