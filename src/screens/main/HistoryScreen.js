// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// History (T-48): every saved trip, most recent first, PAGE_SIZE at a time ("Ver más"). Cancelled
// trips say "Cancelado" in text (not only colour) and show "Sin cobro" instead of amounts.

import { DrawerActions } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ScreenState } from '../../components/ScreenState';
import { SecondaryButton } from '../../components/SecondaryButton';
import { labels } from '../../constants/labels';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { useTrips } from '../../hooks/useTrips';
import { color, radius, space, touch, type } from '../../theme/tokens';
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
  const route = fillLabel(labels.history.route, { origin: trip.originLabel, destination: trip.destinationLabel });
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

  return (
    <View testID={`history-item-${trip.id}`} style={styles.item} accessible accessibilityLabel={a11y}>
      <View style={styles.head}>
        <Text style={styles.muted}>{date}</Text>
        <Text style={cancelled ? styles.statusCancelled : styles.statusDone}>{statusText}</Text>
      </View>
      <Text style={styles.name}>{trip.passengerName}</Text>
      <Text style={styles.body}>{route}</Text>
      {cancelled ? (
        <Text style={styles.muted}>{labels.history.cancelledAmounts}</Text>
      ) : (
        <View style={styles.amounts}>
          <Text style={styles.body}>
            {labels.history.fare}: <Text style={type.numeric}>{formatCop(trip.fare)}</Text>
          </Text>
          <Text style={styles.body}>
            {labels.history.net}: <Text style={type.numeric}>{formatCop(trip.driverEarnings)}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[3] },
  item: { gap: space[1], minHeight: touch.min, padding: space[4], backgroundColor: color.surface, borderRadius: radius.md },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  amounts: { gap: space[1], marginTop: space[1] },
  name: { ...type.title, color: color.text },
  body: { ...type.body, color: color.text },
  muted: { ...type.caption, color: color.textMuted },
  statusDone: { ...type.label, color: color.success },
  statusCancelled: { ...type.label, color: color.danger },
});
