// AI-assisted: see docs/AI_LOG.md #56
// Simple bar chart drawn with View (T-104, RF-48): bar height is the 0..1 ratio of barScale, each bar
// has its text label under it and an accessibilityLabel with label and amount. The whole chart has one
// readable summary (total and highest bar) as text, so nothing depends on colour. With many bars only
// every Nth label is drawn (labelStep). No data shows a text state, never bars of undefined height.
// Tokens only; texts come from labels.js.

import { StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { borderWidth, color, radius, space, type } from '../theme/tokens';
import { barScale, chartSummary } from '../utils/chartData';
import { showsLabel } from '../utils/chartLayout';
import { fillLabel, formatCop } from '../utils/format';

const PLOT_HEIGHT = space[7] * 2;

// groups: [{ key, label, value }] from groupNetEarnings.
export function BarChart({ groups, testID = 'bar-chart' }) {
  const list = Array.isArray(groups) ? groups : [];
  const summary = chartSummary(list);
  const scale = barScale(list);

  if (list.length === 0 || summary.total <= 0) {
    return (
      <View testID={testID} style={styles.root} accessible accessibilityLabel={`${labels.history.chartTitle}. ${labels.history.chartEmpty}`}>
        <Text style={styles.title}>{labels.history.chartTitle}</Text>
        <Text style={styles.muted}>{labels.history.chartEmpty}</Text>
      </View>
    );
  }

  const summaryA11y =
    fillLabel(labels.history.chartSummary, { total: formatCop(summary.total) }) +
    (summary.top ? fillLabel(labels.history.chartTop, { label: summary.top.label, value: formatCop(summary.top.value) }) : '');

  return (
    <View testID={testID} style={styles.root}>
      <Text style={styles.title}>{labels.history.chartTitle}</Text>
      <View accessible accessibilityLabel={summaryA11y} style={styles.summary}>
        <Text style={styles.total}>{fillLabel(labels.history.chartTotalLine, { total: formatCop(summary.total) })}</Text>
        {summary.top ? (
          <Text style={styles.muted}>{fillLabel(labels.history.chartTopLine, { label: summary.top.label, value: formatCop(summary.top.value) })}</Text>
        ) : null}
      </View>
      <View style={styles.plot}>
        {list.map((group, index) => {
          const ratio = scale[index]?.ratio ?? 0;
          return (
            <View
              key={group.key}
              testID={`${testID}-bar-${index}`}
              style={styles.column}
              accessible
              accessibilityLabel={fillLabel(labels.history.chartBar, { label: group.label, value: formatCop(group.value) })}
            >
              <View style={styles.track}>
                <View style={[styles.bar, ratio > 0 ? { height: ratio * PLOT_HEIGHT } : styles.barZero]} />
              </View>
              <Text numberOfLines={1} style={styles.tick}>
                {showsLabel(index, list.length) ? group.label : ' '}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.muted}>{labels.history.chartNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space[2],
    padding: space[3],
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: color.borderSubtle,
  },
  title: { ...type.title, color: color.text },
  summary: { gap: space[0] },
  total: { ...type.bodyStrong, ...type.numeric, color: color.text },
  muted: { ...type.caption, color: color.textMuted },
  plot: { flexDirection: 'row', alignItems: 'flex-end', gap: space[1] },
  column: { flex: 1, alignItems: 'center', gap: space[1] },
  track: { height: PLOT_HEIGHT, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '80%', backgroundColor: color.primary, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
  barZero: { height: borderWidth.thick, backgroundColor: color.border },
  tick: { ...type.caption, color: color.textMuted, textAlign: 'center', width: '100%' },
});
