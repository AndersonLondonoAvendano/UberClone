// AI-assisted: see AI_LOG.md #52 (single icon component, Ionicons set)
// The only icon component of the app. Ionicons from @expo/vector-icons; size and color come from
// tokens. Icons are decorative: they always accompany a text or an accessibilityLabel and are hidden
// from screen readers. Map (MapLibre) icons are not touched.

import Ionicons from '@expo/vector-icons/Ionicons';
import { color, iconSize } from '../theme/tokens';

export function Icon({ name, size = iconSize.md, tint = color.text, style }) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={tint}
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
