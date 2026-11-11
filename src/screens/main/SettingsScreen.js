// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// AI-assisted: see docs/AI_LOG.md #53 (presentation: Cards, DataRow, note icons)
// Settings (T-49, read-only): app info (name, version), the simulated-payment note and the map credits.
// The provisional panels (shared demo value and account simulator) only render under SHOW_DEV_TOOLS.

import { DrawerActions } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import appConfig from '../../../app.json';
import { Card } from '../../components/Card';
import { DataRow } from '../../components/DataRow';
import { DevAccountSwitch } from '../../components/DevAccountSwitch';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { SHOW_DEV_TOOLS } from '../../constants/devTools';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { color, iconSize, space, type } from '../../theme/tokens';

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
        {/* AI-assisted: see docs/AI_LOG.md #53 */}
        <Card style={styles.group}>
          <Text style={styles.section} accessibilityRole="header">
            {labels.settings.appTitle}
          </Text>
          <View>
            <Field label={labels.settings.appName} value={labels.settings.appNameValue} />
            <Field label={labels.settings.version} value={String(appConfig.expo.version)} last />
          </View>
        </Card>
        <Card style={styles.group}>
          <Note icon="card" text={labels.settings.paymentNote} />
          <Note icon="map" text={labels.settings.mapsNote} />
          <Note icon="information-circle" text={labels.settings.authNote} muted />
        </Card>
        {SHOW_DEV_TOOLS ? (
          <>
            <Card style={styles.group}>
              <Text style={styles.muted}>{labels.demo.sharedValueLabel}</Text>
              <Text testID="settings-shared-value" style={hasValue ? styles.body : styles.muted}>
                {hasValue ? demoValue : labels.demo.sharedValueEmpty}
              </Text>
            </Card>
            <DevAccountSwitch />
          </>
        ) : null}
      </View>
    </PlaceholderScreen>
  );
}

function Field({ label, value, last = false }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`}>
      <DataRow label={label} value={value} last={last} />
    </View>
  );
}

function Note({ icon, text, muted = false }) {
  return (
    <View style={styles.note}>
      <Icon name={icon} size={iconSize.md} tint={color.textMuted} />
      <Text style={muted ? styles.muted : styles.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[3] },
  group: { gap: space[2] },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  section: { ...type.title, color: color.text },
  body: { ...type.body, color: color.text, flexShrink: 1 },
  muted: { ...type.caption, color: color.textMuted, flexShrink: 1 },
});
