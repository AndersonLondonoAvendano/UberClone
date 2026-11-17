// AI-assisted: see AI_LOG.md #51
// Surface hierarchy. variant: 'card' (resting white), 'featured' (dark brand, raised), 'status'
// (soft tone: brand | success | warning | danger). Tokens only; children decide their own text colours.

import { StyleSheet, View } from 'react-native';
import { borderWidth, color, elevation, radius, space } from '../theme/tokens';

const STATUS_BG = {
  brand: color.primarySoft,
  success: color.successSoft,
  warning: color.warningSoft,
  danger: color.dangerSoft,
};

export function Card({ variant = 'card', tone = 'brand', style, children, ...rest }) {
  const variantStyle =
    variant === 'featured'
      ? styles.featured
      : variant === 'status'
        ? [styles.status, { backgroundColor: STATUS_BG[tone] ?? STATUS_BG.brand }]
        : styles.card;
  return (
    <View {...rest} style={[styles.base, variantStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
  },
  card: {
    backgroundColor: color.surface,
    borderWidth: borderWidth.thin,
    borderColor: color.borderSubtle,
    ...elevation.card,
  },
  featured: {
    backgroundColor: color.primaryDark,
    ...elevation.raised,
  },
  status: {},
});
