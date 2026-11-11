// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// AI-assisted: see docs/AI_LOG.md #53 (presentation: status chip, origin/destination icons, DataRow amounts)
// History (T-48): every saved trip, most recent first, PAGE_SIZE at a time ("Ver más"). Cancelled
// trips say "Cancelado" in text (not only colour) and show "Sin cobro" instead of amounts.

import { DrawerActions } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { DataRow } from '../../components/DataRow';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ScreenState } from '../../components/ScreenState';
import { SecondaryButton } from '../../components/SecondaryButton';
import { labels } from '../../constants/labels';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { useTrips } from '../../hooks/useTrips';
import { color, iconSize, space, touch, type } from '../../theme/tokens';
import { fillLabel, formatCop, formatDateTime } from '../../utils/format';

const PAGE_SIZE = 20;

export function HistoryScreen({ navigation }) {
  const { status, trips, retry } = useTrips();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = trips.slice(0, visible);

  return (
    <PlaceholderScreen
      name="history"
      title={labels.drawer.history}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>
        {status === 'loading' ? <ScreenState kind="loading" /> : null}
        {status === 'error' ? <ScreenState kind="error" message={labels.history.errorMessage} onRetry={retry} /> : null}
        {status === 'ready' && trips.length === 0 ? (
          <ScreenState kind="empty" title={labels.history.emptyTitle} message={labels.history.emptyMessage} />
        ) : null}
        {status === 'ready' ? shown.map((trip) => <TripItem key={trip.id} trip={trip} />) : null}
        {status === 'ready' && trips.length > visible ? (
          <SecondaryButton
            testID="history-show-more"
            label={labels.history.showMore}
            accessibilityHint={labels.history.showMoreHint}
            onPress={() => setVisible((n) => n + PAGE_SIZE)}
          />
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

function TripItem({ trip }) {
  const cancelled = trip.status === TRIP_STATUS.CANCELLED;
  const statusText = cancelled ? labels.history.status.cancelled : labels.history.status.completed;
  const date = formatDateTime(trip.finishedAt);
  const a11y =
    fillLabel(labels.history.itemA11y, {
      status: statusText,
      date,
      passenger: trip.passengerName,
      origin: trip.originLabel,
      destination: trip.destinationLabel,
    }) +
    (cancelled
      ? ` ${labels.history.cancelledAmounts}.`
      : fillLabel(labels.history.itemA11yAmounts, { fare: formatCop(trip.fare), net: formatCop(trip.driverEarnings) }));

  // AI-assisted: see docs/AI_LOG.md #53
  return (
    <Card testID={`history-item-${trip.id}`} style={styles.item} accessible accessibilityLabel={a11y}>
      <View style={styles.head}>
        <Text style={styles.muted}>{date}</Text>
        <Chip label={statusText} tone={cancelled ? 'danger' : 'success'} />
      </View>
      <Text style={styles.name}>{trip.passengerName}</Text>
      <View style={styles.route}>
        <View style={styles.point}>
          <Icon name="radio-button-on" size={iconSize.md} tint={color.primary} />
          <Text style={styles.place}>{trip.originLabel}</Text>
        </View>
        <View style={styles.point}>
          <Icon name="location" size={iconSize.md} tint={color.danger} />
          <Text style={styles.place}>{trip.destinationLabel}</Text>
        </View>
      </View>
      {cancelled ? (
        <Text style={styles.muted}>{labels.history.cancelledAmounts}</Text>
      ) : (
        <View>
          <DataRow label={labels.history.fare} value={formatCop(trip.fare)} />
          <DataRow label={labels.history.net} value={formatCop(trip.driverEarnings)} emphasis last />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[3] },
  item: { gap: space[2], minHeight: touch.min },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  route: { gap: space[1] },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  place: { ...type.body, color: color.text, flex: 1 },
  name: { ...type.title, color: color.text },
  muted: { ...type.caption, color: color.textMuted, flexShrink: 1 },
});
