// AI-assisted: see docs/AI_LOG.md #51
// Status chip: soft background plus text, so meaning never depends on colour alone.
// tone: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'. Tokens only.

import { StyleSheet, Text, View } from 'react-native';
import { color, radius, space, type } from '../theme/tokens';

const TONES = {
  neutral: { bg: color.surfaceMuted, fg: color.text },
  brand: { bg: color.primarySoft, fg: color.onPrimarySoft },
  success: { bg: color.successSoft, fg: color.onSuccessSoft },
  warning: { bg: color.warningSoft, fg: color.onWarningSoft },
  danger: { bg: color.dangerSoft, fg: color.onDangerSoft },
};

export function Chip({ label, tone = 'neutral', testID }) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <View testID={testID} style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  text: {
    ...type.label,
  },
});
