// AI-assisted: see docs/AI_LOG.md #14
// Screen header: flat bar with the screen title and one leading button (drawer or back).
// Tokens only; texts come from labels.js. No shadows, borders, icons or own animations.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { color, opacity, space, touch, type } from '../theme/tokens';

// leading: 'drawer' | 'back' | null.
// onLeadingPress is optional so the header does not depend on navigation: without it the button is
// still drawn (testID, size and text stay checkable) and pressing it does nothing.
export function ScreenHeader({ title, leading, onLeadingPress }) {
  const isDrawer = leading === 'drawer';
  const isBack = leading === 'back';

  return (
    <View style={styles.bar}>
      {isDrawer || isBack ? (
        <Pressable
          testID={isDrawer ? 'nav-open-drawer' : 'nav-back'}
          accessibilityRole="button"
          accessibilityLabel={isDrawer ? labels.a11y.openDrawer : labels.a11y.back}
          onPress={onLeadingPress}
          hitSlop={space[1]}
          style={({ pressed }) => [styles.leading, pressed && styles.leadingPressed]}
        >
          <Text style={styles.leadingText}>{isDrawer ? labels.nav.openDrawer : labels.nav.back}</Text>
        </Pressable>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.min,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    backgroundColor: color.surface,
  },
  leading: {
    minHeight: touch.min,
    minWidth: touch.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leadingPressed: {
    // Press feedback changes opacity only, so the layout never moves.
    opacity: opacity.pressed,
  },
  leadingText: {
    ...type.label,
    color: color.text,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    ...type.title,
    color: color.text,
  },
});
