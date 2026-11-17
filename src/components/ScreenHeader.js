// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #14
// AI-assisted: see docs/AI_LOG.md #51 (redesign: raised light bar, pill button with an Ionicons icon)
// AI-assisted: see docs/AI_LOG.md #52 (Icon component replaces the View-drawn icons)
// Screen header: bar with the screen title and one leading icon-only button (drawer or back) on a
// soft brand circle. A single bottom separator: the card elevation (no extra border).
// Tokens only; texts come from labels.js. The bar sits on the status-bar safe area owned by the screen.

// AI-assisted: see docs/AI_LOG.md #60 (compact bar: icon-only 48 dp leading button, no text pill)
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { labels } from '../constants/labels';
import { useLanguage } from '../i18n/useLanguage';
import { color, elevation, iconSize, opacity, radius, space, touch, type } from '../theme/tokens';

// leading: 'drawer' | 'back' | null.
// onLeadingPress is optional so the header does not depend on navigation: without it the button is
// still drawn (testID, size and text stay checkable) and pressing it does nothing.
// AI-assisted: see docs/AI_LOG.md #57 (T-110): optional leadingA11yLabel names the destination of the button.
export function ScreenHeader({ title, leading, onLeadingPress, leadingA11yLabel }) {
  useLanguage();
  const isDrawer = leading === 'drawer';
  const isBack = leading === 'back';

  return (
    <View style={styles.bar}>
      {isDrawer || isBack ? (
        <Pressable
          testID={isDrawer ? 'nav-open-drawer' : 'nav-back'}
          accessibilityRole="button"
          accessibilityLabel={leadingA11yLabel ?? (isDrawer ? labels.a11y.openDrawer : labels.a11y.back)}
          onPress={onLeadingPress}
          style={({ pressed }) => [styles.leading, pressed && styles.leadingPressed]}
        >
          <Icon name={isDrawer ? 'menu' : 'chevron-back'} size={iconSize.lg} tint={color.onPrimarySoft} />
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
    paddingVertical: space[1],
    backgroundColor: color.surface,
    ...elevation.card,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touch.controlHeight,
    minWidth: touch.controlHeight,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  leadingPressed: {
    // Press feedback changes opacity only, so the layout never moves.
    opacity: opacity.pressed,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    ...type.title,
    color: color.text,
  },
});
