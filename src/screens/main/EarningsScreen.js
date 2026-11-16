// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// AI-assisted: see docs/AI_LOG.md #53 (presentation: cards, DataRow, clear selected period)
// Earnings (T-47): net total, commission and completed trips of Today / This week / This month, read
// live from the saved trips. The totals come from the pure computePeriodTotals (local time, week from
// Monday). Cancelled trips are not summed. Tokens only.

import { DrawerActions } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { DataRow } from '../../components/DataRow';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ScreenState } from '../../components/ScreenState';
import { labels } from '../../constants/labels';
import { useEarnings } from '../../hooks/useEarnings';
import { useEarningsTrips } from '../../hooks/useEarningsTrips';
import { useBalance } from '../../hooks/useBalance';
import { badgeSize, borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../../theme/tokens';
import { PERIOD } from '../../utils/earnings';
import { fillLabel, formatClock, formatCop, formatDateTime } from '../../utils/format';

const PERIODS = [PERIOD.DAY, PERIOD.WEEK, PERIOD.MONTH];

export function EarningsScreen({ navigation }) {
  // AI-assisted: see docs/AI_LOG.md #65 (RC-04: day/week/month come from the range read, not the 200 latest;
  // the balance keeps its own source, useTrips)
  const { status, trips: rangeTrips, truncated, retry } = useEarningsTrips();
  // AI-assisted: see docs/AI_LOG.md #66 (B1: the balance reads every trip, not the 200 latest)
  const balanceView = useBalance();
  const [period, setPeriod] = useState(PERIOD.DAY);
  // AI-assisted: see docs/AI_LOG.md #56 (T-108: metrics and balance come from useEarnings, no calculation here)
  const earnings = useEarnings(rangeTrips);
  const totals = earnings[period];
  const balance = balanceView.balance;

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

        {/* AI-assisted: see docs/AI_LOG.md #66 (A4a): the range read hit its 5,000-trip cap */}
        {status === 'ready' && truncated ? (
          <View style={styles.hintRow} testID="earnings-truncated-note" accessibilityLiveRegion="polite">
            <Icon name="information-circle" size={iconSize.md} tint={color.textMuted} />
            <Text style={styles.hintText}>{labels.earnings.truncatedNote}</Text>
          </View>
        ) : null}
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
              <Line label={labels.earnings.count} value={String(totals.count)} />
              <Line label={labels.earnings.gross} value={formatCop(totals.gross)} />
              <Line label={labels.earnings.commission} value={`- ${formatCop(totals.commission)}`} />
              <Line label={labels.earnings.tips} value={formatCop(totals.tips)} />
              <Line label={labels.earnings.average} value={formatCop(totals.average)} last />
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
                  accessibilityLabel={`${trip.passengerName}, ${formatDateTime(trip.finishedAt) || labels.earnings.timeUnknown}, ${formatCop(trip.driverEarnings)}`}
                >
                  <View style={styles.badge}>
                    <Icon name="person" size={iconSize.md} tint={color.onPrimarySoft} />
                  </View>
                  <Text style={styles.body}>
                    {fillLabel(labels.earnings.tripLine, {
                      passenger: trip.passengerName,
                      time: (period === PERIOD.DAY ? formatClock(trip.finishedAt) : formatDateTime(trip.finishedAt)) || labels.earnings.timeUnknown,
                    })}
                  </Text>
                  <Text style={styles.amount}>{formatCop(trip.driverEarnings)}</Text>
                </Card>
              ))}
            </View>
          </>
        ) : null}
        {/* AI-assisted: see docs/AI_LOG.md #55 (T-100) */}
        {/* AI-assisted: see docs/AI_LOG.md #66 (B1): own read of every trip, own loading/error; never 0 on error */}
        {balanceView.kind === 'loading' ? <ScreenState kind="loading" /> : null}
        {balanceView.kind === 'error' ? (
          <ScreenState kind="error" message={labels.earnings.balanceErrorMessage} onRetry={balanceView.retry} />
        ) : null}
        {balanceView.kind === 'noSession' ? (
          <ScreenState kind="empty" title={labels.earnings.balanceNoSessionTitle} message={labels.earnings.balanceNoSessionMessage} />
        ) : null}
        {balanceView.kind === 'ready' ? (
          <Card style={styles.card} testID="earnings-balance">
            <Line
              label={balance < 0 ? labels.earnings.balanceCredit : labels.earnings.balance}
              value={formatCop(Math.abs(balance))}
              last
            />
            <View style={styles.hintRow}>
              <Icon name="information-circle" size={iconSize.md} tint={color.textMuted} />
              <Text style={styles.hintText}>{balance < 0 ? labels.earnings.balanceCreditHint : labels.earnings.balanceHint}</Text>
            </View>
            {balanceView.partial ? (
              <View style={styles.hintRow} testID="earnings-balance-partial" accessibilityLiveRegion="polite">
                <Icon name="information-circle" size={iconSize.md} tint={color.warning} />
                <Text style={styles.partialText}>{fillLabel(labels.earnings.balancePartial, { count: String(balanceView.count) })}</Text>
              </View>
            ) : null}
          </Card>
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
  // AI-assisted: see docs/AI_LOG.md #57 (T-124): the hint wraps to several lines at 200 % font; no fixed
  // width or height and no numberOfLines, so the card grows with the text.
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2], paddingTop: space[2] },
  hintText: { ...type.caption, color: color.textMuted, flex: 1, flexShrink: 1 },
  // AI-assisted: see docs/AI_LOG.md #66 (H-2): the partial notice weighs more than the plain note (14 px, warning tone)
  partialText: { ...type.label, color: color.warning, flex: 1, flexShrink: 1 },
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
