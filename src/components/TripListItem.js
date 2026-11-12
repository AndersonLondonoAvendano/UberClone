// AI-assisted: see docs/AI_LOG.md #56
// One row of the History list (T-106, RF-47): date and time, origin -> destination, category, fare, net
// earning and a Chip with the TEXT of the payment state (cancelled trips say "Cancelado"). The date is
// the creation time of the trip (finishedAt as a fallback), shown by formatDateTime, which guards
// invalid dates. Tokens only; texts come from labels.js.

import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { PAYMENT_STATUS, TRIP_STATUS } from '../constants/tripStatus';
import { color, iconSize, space, touch, type } from '../theme/tokens';
import { fillLabel, formatCop, formatDateTime } from '../utils/format';
import { Card } from './Card';
import { Chip } from './Chip';
import { DataRow } from './DataRow';
import { Icon } from './Icon';

const PAYMENT_CHIP = {
  [PAYMENT_STATUS.PENDING]: { tone: 'warning', icon: 'time-outline' },
  [PAYMENT_STATUS.APPROVED]: { tone: 'success', icon: 'checkmark-circle' },
  [PAYMENT_STATUS.REJECTED]: { tone: 'danger', icon: 'close-circle' },
  [PAYMENT_STATUS.PAID]: { tone: 'success', icon: 'checkmark-circle' },
};

function TripListItemBase({ trip }) {
  const cancelled = trip.status === TRIP_STATUS.CANCELLED;
  const paymentStatus = trip.paymentStatus ?? (trip.status === TRIP_STATUS.PAID ? PAYMENT_STATUS.PAID : undefined);
  const chipStyle = PAYMENT_CHIP[paymentStatus];
  const statusText = cancelled
    ? labels.history.status.cancelled
    : (labels.history.paymentStatus[paymentStatus] ?? labels.history.paymentUnknown);
  const date = formatDateTime(trip.createdAt ?? trip.finishedAt) || labels.history.dateUnknown;
  const category = labels.registration.vehicleCategory[trip.category];
  const origin = trip.originLabel;
  const destination = trip.destinationLabel;

  const a11y =
    fillLabel(labels.history.itemA11y, { status: statusText, date, passenger: trip.passengerName, origin, destination }) +
    (category ? fillLabel(labels.history.itemCategory, { category }) : '') +
    (cancelled
      ? ` ${labels.history.cancelledAmounts}.`
      : fillLabel(labels.history.itemA11yAmounts, { fare: formatCop(trip.fare), net: formatCop(trip.driverEarnings) }));

  return (
    <Card testID={`history-item-${trip.id}`} style={styles.item} accessible accessibilityLabel={a11y}>
      <View style={styles.head}>
        <Text style={styles.muted}>{date}</Text>
        <Chip
          label={statusText}
          tone={cancelled ? 'danger' : (chipStyle?.tone ?? 'neutral')}
          icon={cancelled ? 'close-circle' : chipStyle?.icon}
        />
      </View>
      <View style={styles.route}>
        <View style={styles.point}>
          <Icon name="radio-button-on" size={iconSize.md} tint={color.primary} />
          <Text style={styles.place}>{origin}</Text>
        </View>
        <View style={styles.point}>
          <Icon name="location" size={iconSize.md} tint={color.danger} />
          <Text style={styles.place}>{destination}</Text>
        </View>
      </View>
      {category ? <Text style={styles.muted}>{`${labels.trip.category}: ${category}`}</Text> : null}
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

export const TripListItem = memo(TripListItemBase);

const styles = StyleSheet.create({
  item: { gap: space[2], minHeight: touch.min },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3], flexWrap: 'wrap' },
  route: { gap: space[1] },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  place: { ...type.body, color: color.text, flex: 1 },
  muted: { ...type.caption, color: color.textMuted, flexShrink: 1 },
});
