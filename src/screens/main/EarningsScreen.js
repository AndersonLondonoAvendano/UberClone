// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// Earnings (T-47): net total, commission and completed trips of Today / This week / This month, read
// live from the saved trips. The totals come from the pure computePeriodTotals (local time, week from
// Monday). Cancelled trips are not summed. Tokens only, no borders: surface steps separate blocks.

import { DrawerActions } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ScreenState } from '../../components/ScreenState';
import { labels } from '../../constants/labels';
import { useTrips } from '../../hooks/useTrips';
import { color, radius, space, touch, type } from '../../theme/tokens';
import { computePeriodTotals, PERIOD } from '../../utils/earnings';
import { fillLabel, formatClock, formatCop, formatDateTime } from '../../utils/format';

const PERIODS = [PERIOD.DAY, PERIOD.WEEK, PERIOD.MONTH];

export function EarningsScreen({ navigation }) {
  const { status, trips, retry } = useTrips();
  const [period, setPeriod] = useState(PERIOD.DAY);
  const totals = useMemo(() => computePeriodTotals(trips, period, Date.now()), [trips, period]);

  return (
    <PlaceholderScreen
      name="earnings"
      title={labels.drawer.earnings}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>
        <View style={styles.periods} accessibilityRole="radiogroup" accessibilityLabel={labels.earnings.periodsA11y}>
          {PERIODS.map((item) => {
            const selected = item === period;
            return (
              <Pressable
                key={item}
                testID={`earnings-period-${item}`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setPeriod(item)}
                style={[styles.period, selected && styles.periodSelected]}
              >
                <Text style={[styles.periodText, selected && styles.periodTextSelected]}>{labels.earnings.periods[item]}</Text>
              </Pressable>
            );
          })}
        </View>
        {period === PERIOD.WEEK ? <Text style={styles.muted}>{labels.earnings.weekNote}</Text> : null}

        {status === 'loading' ? <ScreenState kind="loading" /> : null}
        {status === 'error' ? <ScreenState kind="error" message={labels.earnings.errorMessage} onRetry={retry} /> : null}
        {status === 'ready' && totals.count === 0 ? (
          <ScreenState kind="empty" title={labels.earnings.emptyTitle} message={labels.earnings.emptyMessage} />
        ) : null}
        {status === 'ready' && totals.count > 0 ? (
          <>
            <View
              testID="earnings-net"
              style={styles.summary}
              accessible
              accessibilityLabel={`${labels.earnings.net}: ${formatCop(totals.net)}`}
            >
              <Text style={styles.label}>{labels.earnings.net}</Text>
              <Text style={styles.net}>{formatCop(totals.net)}</Text>
            </View>
            <View style={styles.summary}>
              <Line label={labels.earnings.commission} value={`- ${formatCop(totals.commission)}`} />
              <Line label={labels.earnings.count} value={String(totals.count)} />
            </View>
            <Text style={styles.section} accessibilityRole="header">
              {labels.earnings.tripsTitle}
            </Text>
            <View style={styles.list}>
              {totals.trips.map((trip) => (
                <View
                  key={trip.id}
                  style={styles.trip}
                  accessible
                  accessibilityLabel={`${trip.passengerName}, ${formatDateTime(trip.finishedAt)}, ${formatCop(trip.driverEarnings)}`}
                >
                  <Text style={styles.body}>
                    {fillLabel(labels.earnings.tripLine, {
                      passenger: trip.passengerName,
                      time: period === PERIOD.DAY ? formatClock(trip.finishedAt) : formatDateTime(trip.finishedAt),
                    })}
                  </Text>
                  <Text style={[styles.body, type.numeric]}>{formatCop(trip.driverEarnings)}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

function Line({ label, value }) {
  return (
    <View style={styles.line} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.body}>{label}</Text>
      <Text style={[styles.body, type.numeric]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[3] },
  periods: { flexDirection: 'row', gap: space[2] },
  period: {
    flex: 1,
    minHeight: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  periodSelected: { backgroundColor: color.primary },
  periodText: { ...type.label, color: color.text, textAlign: 'center' },
  periodTextSelected: { color: color.onPrimary },
  summary: { gap: space[2], padding: space[4], backgroundColor: color.surface, borderRadius: radius.md },
  label: { ...type.label, color: color.textMuted },
  net: { ...type.display, ...type.numeric, color: color.primary },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3], minHeight: touch.min },
  section: { ...type.title, color: color.text },
  list: { gap: space[2] },
  trip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.min,
    padding: space[3],
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  body: { ...type.body, color: color.text, flexShrink: 1 },
  muted: { ...type.caption, color: color.textMuted },
});
