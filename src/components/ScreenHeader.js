// AI-assisted: see docs/AI_LOG.md #14
// AI-assisted: see docs/AI_LOG.md #51 (redesign: raised light bar, pill button with an Ionicons icon)
// AI-assisted: see docs/AI_LOG.md #52 (Icon component replaces the View-drawn icons)
// Screen header: raised bar with the screen title and one leading button (drawer or back). The
// button is a soft brand pill with an icon (menu or chevron) plus its text.
// Tokens only; texts come from labels.js. The bar sits on the status-bar safe area owned by the screen.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { labels } from '../constants/labels';
import { borderWidth, color, elevation, iconSize, opacity, radius, space, touch, type } from '../theme/tokens';

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
          <Icon name={isDrawer ? 'menu' : 'chevron-back'} size={iconSize.lg} tint={color.onPrimarySoft} />
          <Text numberOfLines={1} style={styles.leadingText}>{isDrawer ? labels.nav.openDrawer : labels.nav.back}</Text>
        </Pressable>
      ) : null}
      <Text accessibilityRole="header" numberOfLines={2} style={styles.title}>
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
    minHeight: touch.controlHeight + space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    backgroundColor: color.surface,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: color.borderSubtle,
    ...elevation.card,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: touch.min,
    minWidth: touch.min,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  leadingPressed: {
    // Press feedback changes opacity only, so the layout never moves.
    opacity: opacity.pressed,
  },
  leadingText: {
    ...type.label,
    color: color.onPrimarySoft,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    ...type.title,
    color: color.text,
  },
});
