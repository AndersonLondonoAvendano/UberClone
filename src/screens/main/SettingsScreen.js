// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// Settings (T-49, read-only): app info (name, version), the simulated-payment note and the map credits.
// The provisional panels (shared demo value and account simulator) only render under SHOW_DEV_TOOLS.

import { DrawerActions } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import appConfig from '../../../app.json';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { SHOW_DEV_TOOLS } from '../../constants/devTools';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { color, radius, space, touch, type } from '../../theme/tokens';

export function SettingsScreen({ navigation }) {
  const { demoValue } = useAppState();
  const hasValue = demoValue !== '';

  return (
    <PlaceholderScreen
      name="settings"
      title={labels.drawer.settings}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>
        <View style={styles.group}>
          <Text style={styles.section} accessibilityRole="header">
            {labels.settings.appTitle}
          </Text>
          <Field label={labels.settings.appName} value={labels.settings.appNameValue} />
          <Field label={labels.settings.version} value={String(appConfig.expo.version)} numeric />
        </View>
        <View style={styles.group}>
          <Text style={styles.body}>{labels.settings.paymentNote}</Text>
          <Text style={styles.body}>{labels.settings.mapsNote}</Text>
          <Text style={styles.muted}>{labels.settings.authNote}</Text>
        </View>
        {SHOW_DEV_TOOLS ? (
          <>
            <View style={styles.group}>
              <Text style={styles.muted}>{labels.demo.sharedValueLabel}</Text>
              <Text testID="settings-shared-value" style={hasValue ? styles.body : styles.muted}>
                {hasValue ? demoValue : labels.demo.sharedValueEmpty}
              </Text>
            </View>
            <DevAccountSwitch />
          </>
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

function Field({ label, value, numeric = false }) {
  return (
    <View style={styles.field} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={[styles.body, numeric && type.numeric]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[3] },
  group: { gap: space[2], padding: space[4], backgroundColor: color.surface, borderRadius: radius.md },
  section: { ...type.title, color: color.text },
  field: { gap: space[1], minHeight: touch.min, justifyContent: 'center' },
  body: { ...type.body, color: color.text },
  muted: { ...type.caption, color: color.textMuted },
});
