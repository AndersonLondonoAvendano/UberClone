// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #51
// Status chip: soft background plus text, so meaning never depends on colour alone.
// tone: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'. Tokens only.

import { StyleSheet, Text, View } from 'react-native';
import { color, iconSize, radius, space, type } from '../theme/tokens';
import { Icon } from './Icon';

const TONES = {
  neutral: { bg: color.surfaceMuted, fg: color.text },
  brand: { bg: color.primarySoft, fg: color.onPrimarySoft },
  success: { bg: color.successSoft, fg: color.onSuccessSoft },
  warning: { bg: color.warningSoft, fg: color.onWarningSoft },
  danger: { bg: color.dangerSoft, fg: color.onDangerSoft },
};

// AI-assisted: see AI_LOG.md #55 (optional icon next to the text, T-96)
export function Chip({ label, tone = 'neutral', testID, icon }) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <View testID={testID} style={[styles.chip, { backgroundColor: t.bg }]}>
      {icon ? <Icon name={icon} size={iconSize.sm} tint={t.fg} /> : null}
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderRadius: radius.full,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  text: {
    ...type.label,
    flexShrink: 1,
  },
});
