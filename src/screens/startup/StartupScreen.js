// AI-assisted: see AI_LOG.md #20
// AI-assisted: see AI_LOG.md #54
// Startup screens shown while the account status is loading or failed. They use the shared
// remote-data state block; the error variant also offers "Cerrar sesión" (AccountActions,
// registration variant) so the driver is never stuck without a way out. Only AppState is
// available here: the optional readers in useSessionReset return null for the other providers.

import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountActions } from '../../components/auth/AccountActions';
import { ScreenState } from '../../components/ScreenState';
import { useAppState } from '../../context/AppStateContext';
import { color, space } from '../../theme/tokens';

const SAFE_EDGES = ['top', 'bottom'];

// kind: 'loading' | 'error'. Only the error variant gets a retry action and the sign-out button.
export function StartupScreen({ kind }) {
  const { retryAccountStatus } = useAppState();

  return (
    <SafeAreaView testID="screen-startup" edges={SAFE_EDGES} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenState kind={kind} onRetry={kind === 'error' ? retryAccountStatus : undefined} />
        {kind === 'error' ? <AccountActions variant="registration" /> : null}
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
