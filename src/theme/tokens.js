// AI-assisted: see docs/AI_LOG.md #11
// AI-assisted: see docs/AI_LOG.md #14
// AI-assisted: see docs/AI_LOG.md #16
// AI-assisted: see docs/AI_LOG.md #23
// AI-assisted: see docs/AI_LOG.md #51 (redesign: semantic palette, soft variants, type/space/radius scales, elevations)
// Design tokens. Single source for colors, type, spacing, radii, elevations and touch sizes.

export const color = {
  bg: '#EEF2F1',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F8F7',
  border: '#77847F',
  borderSubtle: '#C5D0CC',
  text: '#14201C',
  textMuted: '#4A5A54',
  primary: '#006D77',
  primaryDark: '#00383E',
  primarySoft: '#DDEFF0',
  onPrimary: '#FFFFFF',
  onPrimarySoft: '#00474E',
  onBrand: '#FFFFFF',
  onBrandMuted: '#BFE0E3',
  success: '#2E7D32',
  successSoft: '#E3F2E4',
  onSuccessSoft: '#1B5E20',
  warning: '#8A5300',
  warningSoft: '#FFF0D6',
  onWarningSoft: '#6B3F00',
  danger: '#B3261E',
  dangerSoft: '#FBE4E2',
  onDangerSoft: '#8C1D18',
  skeleton: '#C9D4D0',
};

// Inter per weight: on Android the weight is chosen by the font family, so each weight has its own
// family name (loaded in App.js). Until the font loads, or if it fails, the system font is used:
// fontWeight is omitted on purpose: a weight on a custom family can fake-bold on Android. If the font
// does not load, the system font is used and no layout depends on it.
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// Icon sizes (px). Always paired with a text; sizes 20 and 24 are the standard.
export const iconSize = { sm: 16, md: 20, lg: 24 };

export const type = {
  hero: { fontSize: 40, lineHeight: 46, fontFamily: fontFamily.bold },
  display: { fontSize: 28, lineHeight: 34, fontFamily: fontFamily.bold },
  title: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.semibold },
  heading: { fontSize: 18, lineHeight: 24, fontFamily: fontFamily.semibold },
  body: { fontSize: 16, lineHeight: 22, fontFamily: fontFamily.regular },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontFamily: fontFamily.semibold },
  label: { fontSize: 14, lineHeight: 18, fontFamily: fontFamily.medium },
  small: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular },
  // Compose with another type.* for figures (fares, earnings, times, distances): style={[type.display, type.numeric]}
  numeric: { fontVariant: ['tabular-nums'] },
};

export const space = { 0: 2, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48 };

export const radius = { sm: 8, md: 12, lg: 20, xl: 28, full: 999 };

export const touch = { min: 44, controlHeight: 48, gap: 8 };

export const opacity = { pressed: 0.9, disabled: 0.5 };

export const borderWidth = { thin: 1, thick: 2 };

// Fixed presentation sizes: profile avatar diameter, left accent bar of the active drawer entry and the
// decorative header shape.
export const avatarSize = { md: 64 };
export const accentWidth = 4;
export const shapeSize = 160;
// Diameter of the round badge that holds a decorative icon.
export const badgeSize = 40;

// Elevation levels (iOS shadow + Android elevation). none: flat on the base; card: resting surface;
// raised: featured card or sheet over the map.
export const elevation = {
  none: {},
  card: {
    shadowColor: '#0B2B2F',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#0B2B2F',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};

// Motion durations (ms) for the subtle Animated transitions.
export const motion = { fast: 150, base: 220, slow: 400 };

// AI-assisted: see docs/AI_LOG.md #53
// Map marker geometry (px): the driver is a filled dot, the target is a larger ring, so they differ by
// shape and not only by colour.
export const mapMarker = { driverRadius: 8, driverStroke: 3, targetRadius: 11, targetStroke: 4 };

// AI-assisted: see docs/AI_LOG.md #53
// Height (px) of the photo preview frame of the registration photo fields.
export const photoPreviewHeight = 160;
