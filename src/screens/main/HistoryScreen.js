// AI-assisted: see AI_LOG.md #67 (T-258/T-259: the screen follows the active language)
// AI-assisted: see AI_LOG.md #19
// AI-assisted: see AI_LOG.md #50
// AI-assisted: see AI_LOG.md #53 (presentation: status chip, origin/destination icons, DataRow amounts)
// AI-assisted: see AI_LOG.md #56
// History (T-106, RF-47, RF-48): its own FlatList (never inside a ScrollView) with the filters and the
// net-earnings chart as the list header. Most recent first, 20 per load, "Cargar más" button (no
// infinite scroll). Loading, empty and error states; an invalid Rango queries nothing and shows its
// error text. The chart sums the trips already loaded (and the chosen payment method).

import { DrawerActions } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from '../../components/BarChart';
import { HistoryFilters } from '../../components/HistoryFilters';
import { FieldError } from '../../components/registration/FieldError';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenState } from '../../components/ScreenState';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TripListItem } from '../../components/TripListItem';
import { labels } from '../../constants/labels';
import { useLanguage } from '../../i18n/useLanguage';
import { useTripHistory } from '../../hooks/useTripHistory';
import { color, space } from '../../theme/tokens';
import { groupNetEarnings } from '../../utils/chartData';
import { HISTORY_PERIOD, resolveHistoryQuery } from '../../utils/historyFilters';
import { HISTORY_METHOD } from '../../utils/historyQuery';

const keyExtractor = (trip) => trip.id;

export function HistoryScreen({ navigation }) {
  const { language } = useLanguage(); // re-render on language change (RI-15)
  const [period, setPeriod] = useState(HISTORY_PERIOD.DAY);
  const [method, setMethod] = useState(HISTORY_METHOD.ALL);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // The clock is read when the period changes, so the query and the chart share the same limits.
  const [now, setNow] = useState(() => Date.now());
  const changePeriod = useCallback((next) => {
    setNow(Date.now());
    setPeriod(next);
  }, []);
  const query = useMemo(() => resolveHistoryQuery(period, startDate, endDate, now), [period, startDate, endDate, now]);
  const { trips, status, loadingMore, hasMore, error, loadMore, retry } = useTripHistory({ start: query.start, end: query.end, method });
  const groups = useMemo(
    () => groupNetEarnings(trips, period, period === HISTORY_PERIOD.RANGE ? { start: query.start, end: query.end } : null, now),
    [trips, period, query.start, query.end, now, language],
  );

  // AI-assisted: see AI_LOG.md #57 (T-110)
  const openTrip = useCallback((trip) => navigation.navigate('TripDetail', { trip }), [navigation]);
  const renderItem = useCallback(({ item }) => <TripListItem trip={item} onOpen={openTrip} />, [openTrip]);
  const openDrawer = useCallback(() => navigation.dispatch(DrawerActions.openDrawer()), [navigation]);

  const header = (
    <View style={styles.header}>
      <HistoryFilters
        period={period}
        onPeriodChange={changePeriod}
        method={method}
        onMethodChange={setMethod}
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        rangeError={query.error}
      />
      {status === 'ready' ? <BarChart groups={groups} /> : null}
    </View>
  );

  let empty = null;
  if (status === 'loading') empty = <ScreenState kind="loading" />;
  else if (status === 'error') empty = <ScreenState kind="error" message={labels.history.errorMessage} onRetry={retry} />;
  else if (status === 'ready') empty = <ScreenState kind="empty" title={labels.history.emptyTitle} message={labels.history.emptyMessage} />;

  let footer = null;
  if (status === 'ready' && trips.length > 0) {
    if (loadingMore) footer = <ScreenState kind="loading" title={labels.history.loadingMore} />;
    else if (hasMore && error) {
      // Loading more failed: text + icon in a polite region, and a retry that asks for the same page.
      footer = (
        <View style={styles.footer}>
          <FieldError testID="history-load-more-error" message={labels.history.loadMoreError} liveRegion="polite" />
          <SecondaryButton testID="history-load-more-retry" label={labels.actions.retry} onPress={loadMore} style={styles.footer} />
        </View>
      );
    } else if (hasMore) {
      footer = (
        <SecondaryButton
          testID="history-load-more"
          label={labels.history.loadMore}
          accessibilityHint={labels.history.loadMoreHint}
          onPress={loadMore}
          style={styles.footer}
        />
      );
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader title={labels.drawer.history} leading="drawer" onLeadingPress={openDrawer} />
      <FlatList
        testID="history-list"
        data={status === 'ready' ? trips : []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { padding: space[4], paddingBottom: space[6] },
  header: { gap: space[4], paddingBottom: space[4] },
  separator: { height: space[3] },
  footer: { marginTop: space[3] },
});
