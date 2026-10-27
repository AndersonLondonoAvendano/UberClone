// AI-assisted: see docs/AI_LOG.md #11
// AI-assisted: see docs/AI_LOG.md #14
// AI-assisted: see docs/AI_LOG.md #16
// Design tokens. Single source for colors, type, spacing, radii and touch sizes.

export const color = {
  bg: '#F3F5F4',
  surface: '#FFFFFF',
  border: '#77847F',
  text: '#14201C',
  textMuted: '#4A5A54',
  primary: '#006D77',
  onPrimary: '#FFFFFF',
  success: '#2E7D32',
  warning: '#8A5300',
  danger: '#B3261E',
};

export const type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
};

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 };

export const radius = { sm: 8, md: 12, lg: 20, full: 999 };

export const touch = { min: 44, controlHeight: 48, gap: 8 };

export const opacity = { pressed: 0.9 };

export const borderWidth = { thin: 1 };
