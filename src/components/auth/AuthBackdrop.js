// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #60
// Brand block shared by the three authentication screens: a dark primary band with a curved bottom
// edge, the decorative circle of the drawer header, a ring echoing it, the brand mark and the
// wordmark. The form card of each screen overlaps its lower edge (see AuthScreenLayout). Only tokens;
// the band has no fixed height, so it grows with the text size. Purely decorative shapes are hidden
// from screen readers; the wordmark is the screen's header.

import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Icon';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { avatarSize, borderWidth, color, iconSize, radius, shapeSize, space, type } from '../../theme/tokens';

export function AuthBackdrop({ topInset = 0 }) {
  useLanguage();
  const TEXT = labels.auth;
  return (
    <View testID="auth-backdrop" style={[styles.band, { paddingTop: topInset + space[6] }]}>
      <View style={styles.circle} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
      <View style={styles.ring} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
      <View style={styles.mark} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Icon name="car" size={iconSize.lg} tint={color.onBrand} />
      </View>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={styles.wordmark}
      >
        {TEXT.brand}
      </Text>
      <Text style={styles.tagline}>{TEXT.tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    overflow: 'hidden',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[5],
    // Extra bottom room: the form card overlaps this part of the band.
    paddingBottom: space[7] + space[5],
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    backgroundColor: color.primaryDark,
  },
  circle: {
    position: 'absolute',
    top: -shapeSize / 3,
    right: -shapeSize / 3,
    width: shapeSize,
    height: shapeSize,
    borderRadius: shapeSize / 2,
    backgroundColor: color.primary,
  },
  ring: {
    position: 'absolute',
    bottom: -shapeSize / 4,
    left: -shapeSize / 4,
    width: shapeSize / 1.5,
    height: shapeSize / 1.5,
    borderRadius: shapeSize / 3,
    borderWidth: borderWidth.thick,
    borderColor: color.primary,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: avatarSize.md,
    height: avatarSize.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thick,
    borderColor: color.onBrandMuted,
    backgroundColor: color.primary,
  },
  wordmark: {
    ...type.hero,
    // Tight tracking for the large wordmark, derived from the spacing scale.
    letterSpacing: -space[0] / 2,
    color: color.onBrand,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  tagline: {
    ...type.body,
    color: color.onBrandMuted,
    textAlign: 'center',
  },
});
