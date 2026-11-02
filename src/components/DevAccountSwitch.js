// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #20
// PROVISIONAL: simulates the driver account status on the device. Removed by the registration and
// settings features once the account status is real.
// It is always visible (loading has no retry button, so it must never hide). Tokens only; texts
// come from labels.js.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ACCOUNT_STATUS } from '../constants/accountStatus';
import { labels } from '../constants/labels';
import { useAppState } from '../context/AppStateContext';
import { color, space, touch, type } from '../theme/tokens';

const OPTIONS = [
  { status: ACCOUNT_STATUS.LOADING, label: labels.devAccount.loading },
  { status: ACCOUNT_STATUS.PENDING, label: labels.devAccount.pending },
  { status: ACCOUNT_STATUS.APPROVED, label: labels.devAccount.approved },
  { status: ACCOUNT_STATUS.ERROR, label: labels.devAccount.error },
];

export function DevAccountSwitch() {
  const { accountStatus, simulateAccountStatus } = useAppState();

  return (
    <View style={styles.group}>
      <Text style={styles.legend}>{labels.devAccount.title}</Text>
      <View style={styles.row}>
        {OPTIONS.map(({ status, label }) => {
          const selected = status === accountStatus;
          return (
            <Pressable
              key={status}
              testID={`dev-account-${status}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => simulateAccountStatus(status)}
              style={styles.option}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: space[2],
  },
  legend: {
    ...type.label,
    color: color.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: touch.gap,
  },
  option: {
    minHeight: touch.min,
    minWidth: touch.min,
    justifyContent: 'center',
    paddingHorizontal: space[3],
  },
  optionText: {
    ...type.body,
    color: color.textMuted,
  },
  optionTextSelected: {
    color: color.text,
    fontWeight: type.title.fontWeight,
    textDecorationLine: 'underline',
  },
});
