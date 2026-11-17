// AI-assisted: see docs/AI_LOG.md #67
// AI-assisted: see docs/AI_LOG.md #56
// One row of the History list (T-106, RF-47): date and time, origin -> destination, category, fare, net
// earning and a Chip with the TEXT of the payment state (cancelled trips say "Cancelado"). The date is
// the creation time of the trip (finishedAt as a fallback), shown by formatDateTime, which guards
// invalid dates. Tokens only; texts come from labels.js.

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { useLanguage } from '../i18n/useLanguage';
import { PAYMENT_STATUS, TRIP_STATUS } from '../constants/tripStatus';
import { color, iconSize, opacity, space, touch, type } from '../theme/tokens';
import { legacyPaymentChip } from '../services/trip/legacyTrip';
import { REJECTED_CHIP } from '../services/trip/tripDetailView';
import { fillLabel, formatCop, formatDateTime } from '../utils/format';
import { Card } from './Card';
import { Chip } from './Chip';
import { DataRow } from './DataRow';
import { Icon } from './Icon';

const HIDDEN_FROM_A11Y = { importantForAccessibility: 'no-hide-descendants', accessibilityElementsHidden: true };

const PAYMENT_CHIP = {
  [PAYMENT_STATUS.PENDING]: { tone: 'warning', icon: 'time-outline' },
  [PAYMENT_STATUS.APPROVED]: { tone: 'success', icon: 'checkmark-circle' },
  [PAYMENT_STATUS.REJECTED]: { tone: 'danger', icon: 'close-circle' },
  [PAYMENT_STATUS.PAID]: { tone: 'success', icon: 'checkmark-circle' },
};

function TripListItemBase({ trip, onOpen }) {
  useLanguage();
  const cancelled = trip.status === TRIP_STATUS.CANCELLED;
  const paymentStatus = trip.paymentStatus ?? (trip.status === TRIP_STATUS.PAID ? PAYMENT_STATUS.PAID : undefined);
  const chipStyle = PAYMENT_CHIP[paymentStatus];
  // AI-assisted: see docs/AI_LOG.md #57 (T-123, RF-54)
  // A legacy trip (no paymentMethod and no paymentStatus) gets the neutral chip with the TEXT
  // "Cobro simulado" instead of "Pago sin estado"; every other trip keeps its real state.
  // AI-assisted: see docs/AI_LOG.md #66 (T-230: «Rechazado», its own icon, "Sin cobro", no "Cobro simulado" chip)
  const rejected = trip.status === TRIP_STATUS.REJECTED;
  const noCharge = cancelled || rejected;
  const legacyChip = noCharge ? null : legacyPaymentChip(trip);
  const statusText = cancelled
    ? labels.history.status.cancelled
    : rejected
      ? labels.history.status.rejected
      : (legacyChip?.label ?? labels.history.paymentStatus[paymentStatus] ?? labels.history.paymentUnknown);
  const date = formatDateTime(trip.createdAt ?? trip.finishedAt) || labels.history.dateUnknown;
  const category = labels.registration.vehicleCategory[trip.category];
  const origin = trip.originLabel;
  const destination = trip.destinationLabel;

  const a11y =
    fillLabel(labels.history.itemA11y, { status: statusText, date, passenger: trip.passengerName, origin, destination }) +
    (category ? fillLabel(labels.history.itemCategory, { category }) : '') +
    (noCharge
      ? ` ${labels.history.cancelledAmounts}.`
      : fillLabel(labels.history.itemA11yAmounts, { fare: formatCop(trip.fare), net: formatCop(trip.driverEarnings) }));

  const card = (
    <Card
      testID={`history-item-${trip.id}`}
      style={styles.item}
      accessible
      accessibilityLabel={a11y}
      {...(onOpen ? HIDDEN_FROM_A11Y : null)}
    >
      <View style={styles.head}>
        <Text style={styles.muted}>{date}</Text>
        <Chip
          label={statusText}
          tone={cancelled ? 'danger' : rejected ? REJECTED_CHIP.tone : (legacyChip?.tone ?? chipStyle?.tone ?? 'neutral')}
          icon={cancelled ? 'close-circle' : rejected ? REJECTED_CHIP.icon : (legacyChip?.icon ?? chipStyle?.icon)}
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
      {noCharge ? (
        <Text style={styles.muted}>{labels.history.cancelledAmounts}</Text>
      ) : (
        <View>
          <DataRow label={labels.history.fare} value={formatCop(trip.fare)} />
          <DataRow label={labels.history.net} value={formatCop(trip.driverEarnings)} emphasis last />
        </View>
      )}
    </Card>
  );

  // AI-assisted: see docs/AI_LOG.md #57 (T-110)
  // With onOpen the whole row is one button that opens the trip detail; the Card keeps its testID and
  // label but hides from the accessibility tree so the screen reader focuses the button once.
  if (!onOpen) return card;
  return (
    <Pressable
      testID={`history-item-open-${trip.id}`}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityHint={labels.history.detail.openHint}
      onPress={() => onOpen(trip)}
      style={({ pressed }) => [styles.open, pressed && styles.pressed]}
    >
      {card}
    </Pressable>
  );
}

export const TripListItem = memo(TripListItemBase);

const styles = StyleSheet.create({
  open: { minHeight: touch.min },
  pressed: { opacity: opacity.pressed },
  item: { gap: space[2], minHeight: touch.min },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3], flexWrap: 'wrap' },
  route: { gap: space[1] },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  place: { ...type.body, color: color.text, flex: 1 },
  muted: { ...type.caption, color: color.textMuted, flexShrink: 1 },
});
