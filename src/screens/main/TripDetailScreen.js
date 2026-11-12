// AI-assisted: see docs/AI_LOG.md #57 (T-110)
// AI-assisted: see docs/AI_LOG.md #61 (D-124: the rating row shows five stars or "Sin calificación")
// Trip detail (RF-49, RF-54), opened from a History row with the saved trip as the route param. The
// planned route is drawn from the simplified route saved with the trip on a read-only map: no route
// request and no extra tiles beyond what the map already uses. Without a valid route it shows
// "Ruta no disponible" in place of the map. Rows, state chip (legacy trips say "Cobro simulado") and
// rating (only when it exists) come from tripDetailView. Tokens and shared components only.

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { DataRow } from '../../components/DataRow';
import { TripMap } from '../../components/map/TripMap';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenState } from '../../components/ScreenState';
import { Icon } from '../../components/Icon';
import { DETAIL_MAP_HEIGHT } from '../../config/map';
import { labels } from '../../constants/labels';
import { routeBounds, routeToCoordinates } from '../../services/map/routeBounds';
import { tripDetailView } from '../../services/trip/tripDetailView';
import { borderWidth, color, iconSize, radius, space, type } from '../../theme/tokens';
import { formatDateTime } from '../../utils/format';

const STAR_POSITIONS = [1, 2, 3, 4, 5];

export function TripDetailScreen({ navigation, route: screen }) {
  const trip = screen?.params?.trip ?? null;
  const goBack = useCallback(() => navigation.navigate('History'), [navigation]);

  // The Android back button returns to History (the drawer's own back goes to Home).
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goBack();
        return true;
      });
      return () => subscription.remove();
    }, [goBack]),
  );

  const view = useMemo(() => (trip ? tripDetailView(trip) : null), [trip]);
  const coordinates = useMemo(() => routeToCoordinates(view?.route), [view]);
  const bounds = useMemo(() => routeBounds(view?.route), [view]);
  const destination = view?.route ? view.route[view.route.length - 1] : null;
  const date = trip ? formatDateTime(trip.createdAt ?? trip.finishedAt) : '';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader
        title={labels.history.detail.title}
        leading="back"
        onLeadingPress={goBack}
        leadingA11yLabel={labels.history.detail.back}
      />
      <ScrollView testID="trip-detail-scroll" contentContainerStyle={styles.content}>
        {!view ? (
          <ScreenState kind="empty" title={labels.history.detail.emptyTitle} message={labels.history.detail.emptyMessage} />
        ) : (
          <>
            {coordinates && bounds ? (
              <View testID="trip-detail-map" style={styles.map}>
                <TripMap
                  testID="trip-detail-map-view"
                  routeCoordinates={coordinates}
                  target={destination}
                  fitBounds={bounds}
                  follow={false}
                  interactive={false}
                  mapA11yLabel={labels.history.detail.routeA11y}
                  attributionAtBottom
                />
              </View>
            ) : (
              <Card testID="trip-detail-no-route" style={styles.noRoute}>
                <Text accessibilityLiveRegion="polite" style={styles.noRouteText}>
                  {view.routeUnavailableText}
                </Text>
              </Card>
            )}
            <Card testID="trip-detail-card" style={styles.card}>
              {date ? <Text style={styles.date}>{date}</Text> : null}
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>{labels.history.detail.status}</Text>
                <Chip testID="trip-detail-status" label={view.status.label} tone={view.status.tone} icon={view.status.icon} />
              </View>
              <View testID="trip-detail-rating" accessible accessibilityLabel={view.rating.a11y} style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>{labels.history.detail.rating}</Text>
                {view.rating.value !== null ? (
                  <View style={styles.stars}>
                    {STAR_POSITIONS.map((position) => (
                      <Icon
                        key={position}
                        name={position <= view.rating.value ? 'star' : 'star-outline'}
                        size={iconSize.md}
                        tint={position <= view.rating.value ? color.warning : color.textMuted}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.ratingNone}>{view.rating.text}</Text>
                )}
              </View>
              {view.rows.map((row, index) => (
                <DataRow
                  key={row.key}
                  testID={`trip-detail-${row.key}`}
                  label={row.label}
                  value={row.value}
                  last={index === view.rows.length - 1}
                />
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { padding: space[4], paddingBottom: space[6], gap: space[4] },
  map: {
    height: DETAIL_MAP_HEIGHT,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: color.borderSubtle,
    overflow: 'hidden',
  },
  noRoute: { alignItems: 'center' },
  noRouteText: { ...type.bodyStrong, color: color.textMuted, textAlign: 'center' },
  card: { gap: space[1] },
  date: { ...type.caption, color: color.textMuted },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space[3],
    paddingVertical: space[2],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space[3],
    paddingVertical: space[3],
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: color.borderSubtle,
  },
  ratingLabel: { ...type.small, color: color.textMuted, flexShrink: 1 },
  ratingNone: { ...type.bodyStrong, color: color.text, flexShrink: 1, textAlign: 'right' },
  stars: { flexDirection: 'row', gap: space[1] },
  statusLabel: { ...type.small, color: color.textMuted, flexShrink: 1 },
});
