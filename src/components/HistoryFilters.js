// AI-assisted: see AI_LOG.md #67
// AI-assisted: see AI_LOG.md #56
// History filters (T-105, RF-47): period Hoy/Semana/Mes/Rango and payment method Todos/Tarjeta/Efectivo as
// selectable chips (radio groups, 44 dp targets, a check icon plus text when selected). Rango shows two
// DateField (Android only, as DateField itself) and the validateRange error as icon + text in a polite
// live region: no dialogs. The error appears once a date has been picked; before that a hint shows.
// Tokens only; texts come from labels.js.

import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { labels } from '../constants/labels';
import { useLanguage } from '../i18n/useLanguage';
import { borderWidth, color, iconSize, opacity, radius, space, touch, type } from '../theme/tokens';
import { HISTORY_PERIOD } from '../utils/historyFilters';
import { HISTORY_METHOD } from '../utils/historyQuery';
import { Icon } from './Icon';
import { DateField } from './registration/DateField';
import { FieldError } from './registration/FieldError';

const PERIODS = [HISTORY_PERIOD.DAY, HISTORY_PERIOD.WEEK, HISTORY_PERIOD.MONTH, HISTORY_PERIOD.RANGE];
const METHODS = [HISTORY_METHOD.ALL, HISTORY_METHOD.CARD, HISTORY_METHOD.CASH];

function FilterChip({ testID, label, selected, onPress }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
    >
      {selected ? <Icon name="checkmark" size={iconSize.md} tint={color.onPrimary} /> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

// rangeError: text from validateRange (or null). startDate/endDate: Date or null.
export function HistoryFilters({
  period,
  onPeriodChange,
  method,
  onMethodChange,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  rangeError,
}) {
  useLanguage();
  // DateField opens the Android dialog only, so Rango is offered on Android.
  const periods = Platform.OS === 'android' ? PERIODS : PERIODS.filter((item) => item !== HISTORY_PERIOD.RANGE);
  const isRange = period === HISTORY_PERIOD.RANGE;
  const touched = startDate != null || endDate != null;

  return (
    <View style={styles.root}>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={labels.history.periodsA11y}>
        {periods.map((item) => (
          <FilterChip
            key={item}
            testID={`history-period-${item}`}
            label={labels.history.periods[item]}
            selected={item === period}
            onPress={() => onPeriodChange(item)}
          />
        ))}
      </View>
      {isRange ? (
        <View style={styles.dates}>
          <View style={styles.date}>
            <DateField testID="history-range-start" label={labels.history.rangeStart} value={startDate} onChange={onStartChange} />
          </View>
          <View style={styles.date}>
            <DateField testID="history-range-end" label={labels.history.rangeEnd} value={endDate} onChange={onEndChange} />
          </View>
        </View>
      ) : null}
      {isRange ? (
        rangeError && touched ? (
          <FieldError testID="history-range-error" message={rangeError} liveRegion="polite" />
        ) : (
          <Text style={styles.hint}>{labels.history.rangeHint}</Text>
        )
      ) : null}
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={labels.history.methodsA11y}>
        {METHODS.map((item) => (
          <FilterChip
            key={item}
            testID={`history-method-${item}`}
            label={labels.history.methods[item]}
            selected={item === method}
            onPress={() => onMethodChange(item)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space[3] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    minHeight: touch.min,
    minWidth: touch.min,
    paddingHorizontal: space[3],
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: borderWidth.thick,
    borderColor: color.borderSubtle,
  },
  chipSelected: { backgroundColor: color.primary, borderColor: color.primaryDark },
  pressed: { opacity: opacity.pressed },
  chipText: { ...type.label, color: color.text, textAlign: 'center', flexShrink: 1 },
  chipTextSelected: { ...type.bodyStrong, color: color.onPrimary },
  dates: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  date: { flexGrow: 1, flexBasis: '45%' },
  hint: { ...type.caption, color: color.textMuted },
});
