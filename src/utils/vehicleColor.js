// AI-assisted: see docs/AI_LOG.md #54
// Pure: registered vehicle colour text -> colour token. Unknown, empty or 'otro' -> brand colour.
// vehicleBadgeToken picks the badge fill: dark when the glyph is under 3:1 against the light badge.

import { carMarker, color, vehicleColor } from '../theme/tokens';

const COMBINING_MARKS = /[̀-ͯ]/g;

const channel = (hex, i) => {
  const v = parseInt(hex.slice(i, i + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);

export function contrastRatio(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .trim()
    .toLowerCase();

export function vehicleColorToken(value) {
  const key = normalize(value);
  return Object.prototype.hasOwnProperty.call(vehicleColor, key) ? vehicleColor[key] : color.primary;
}

export function vehicleBadgeToken(value) {
  const glyph = vehicleColorToken(value);
  return contrastRatio(glyph, carMarker.badgeLight) < carMarker.minGlyphContrast ? carMarker.badgeDark : carMarker.badgeLight;
}
