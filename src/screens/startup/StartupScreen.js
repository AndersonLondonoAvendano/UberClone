// AI-assisted: see docs/AI_LOG.md #20
// Startup screens shown while the account status is loading or failed. They use the shared
// remote-data state block and add the account simulator below it.

import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { ScreenState } from '../../components/ScreenState';
import { useAppState } from '../../context/AppStateContext';
import { color, space } from '../../theme/tokens';

const SAFE_EDGES = ['top', 'bottom'];

// kind: 'loading' | 'error'. Only the error variant gets a retry action.
export function StartupScreen({ kind }) {
  const { retryAccountStatus } = useAppState();

  return (
    <SafeAreaView testID="screen-startup" edges={SAFE_EDGES} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenState kind={kind} onRetry={kind === 'error' ? retryAccountStatus : undefined} />
        {/* provisional: the account simulator is removed by specs 001 and 008 */}
        <DevAccountSwitch />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  content: {
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    gap: space[5],
  },
});
