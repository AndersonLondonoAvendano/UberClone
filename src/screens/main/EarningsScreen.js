// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// AI-assisted: see docs/AI_LOG.md #53 (presentation: cards, DataRow, clear selected period)
// Earnings (T-47): net total, commission and completed trips of Today / This week / This month, read
// live from the saved trips. The totals come from the pure computePeriodTotals (local time, week from
// Monday). Cancelled trips are not summed. Tokens only.

import { DrawerActions } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { DataRow } from '../../components/DataRow';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ScreenState } from '../../components/ScreenState';
import { labels } from '../../constants/labels';
import { useTrips } from '../../hooks/useTrips';
import { badgeSize, borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
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
        {/* AI-assisted: see docs/AI_LOG.md #53 */}
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
                style={({ pressed }) => [styles.period, selected && styles.periodSelected, pressed && styles.pressed]}
              >
                {selected ? <Icon name="checkmark" size={iconSize.md} tint={color.onPrimary} /> : null}
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
            {/* AI-assisted: see docs/AI_LOG.md #53 */}
            <Card
              variant="status"
              tone="brand"
              testID="earnings-net"
              style={styles.net}
              accessible
              accessibilityLabel={`${labels.earnings.net}: ${formatCop(totals.net)}`}
            >
              <Text style={styles.label}>{labels.earnings.net}</Text>
              <Text style={styles.netValue}>{formatCop(totals.net)}</Text>
            </Card>
            <Card style={styles.card}>
              <Line label={labels.earnings.commission} value={`- ${formatCop(totals.commission)}`} />
              <Line label={labels.earnings.count} value={String(totals.count)} last />
            </Card>
            <Text style={styles.section} accessibilityRole="header">
              {labels.earnings.tripsTitle}
            </Text>
            <View style={styles.list}>
              {totals.trips.map((trip) => (
                <Card
                  key={trip.id}
                  style={styles.trip}
                  accessible
                  accessibilityLabel={`${trip.passengerName}, ${formatDateTime(trip.finishedAt)}, ${formatCop(trip.driverEarnings)}`}
                >
                  <View style={styles.badge}>
                    <Icon name="person" size={iconSize.md} tint={color.onPrimarySoft} />
                  </View>
                  <Text style={styles.body}>
                    {fillLabel(labels.earnings.tripLine, {
                      passenger: trip.passengerName,
                      time: period === PERIOD.DAY ? formatClock(trip.finishedAt) : formatDateTime(trip.finishedAt),
                    })}
                  </Text>
                  <Text style={styles.amount}>{formatCop(trip.driverEarnings)}</Text>
                </Card>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

function Line({ label, value, last = false }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`}>
      <DataRow label={label} value={value} last={last} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[3] },
  periods: { flexDirection: 'row', gap: space[2] },
  period: {
    flex: 1,
    flexDirection: 'row',
    gap: space[1],
    minHeight: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: borderWidth.thick,
    borderColor: color.borderSubtle,
  },
  periodSelected: { backgroundColor: color.primary, borderColor: color.primaryDark },
  pressed: { opacity: opacity.pressed },
  periodText: { ...type.label, color: color.text, textAlign: 'center', flexShrink: 1 },
  periodTextSelected: { ...type.bodyStrong, color: color.onPrimary },
  net: { gap: space[1] },
  card: { gap: space[0] },
  label: { ...type.label, color: color.onPrimarySoft },
  netValue: { ...type.display, ...type.numeric, color: color.onPrimarySoft },
  section: { ...type.title, color: color.text },
  list: { gap: space[2] },
  trip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.min,
    padding: space[3],
  },
  badge: {
    width: badgeSize,
    height: badgeSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  body: { ...type.body, color: color.text, flex: 1 },
  amount: { ...type.bodyStrong, ...type.numeric, color: color.primary, flexShrink: 1, textAlign: 'right' },
  muted: { ...type.caption, color: color.textMuted },
});
