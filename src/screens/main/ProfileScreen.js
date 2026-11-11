// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// AI-assisted: see docs/AI_LOG.md #53 (presentation: bordered avatar, category chip, DataRow groups)
// Profile (T-49, read-only): photo, name, phone, vehicle, masked Mercado Pago email and account
// status. The data comes from the drivers/{uid} document through the existing account subscription
// (AppStateContext.driverProfile): no second listener. No editing and no sign-out.

import { DrawerActions } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { DataRow } from '../../components/DataRow';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ScreenState } from '../../components/ScreenState';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { avatarSize, borderWidth, color, iconSize, radius, space, type } from '../../theme/tokens';
import { maskEmail } from '../../utils/mask';

export function ProfileScreen({ navigation }) {
  const { driverProfile, accountStatus, retryAccountStatus } = useAppState();
  const personal = driverProfile?.personalData;
  const vehicle = driverProfile?.vehicle;
  const documents = driverProfile?.documents;
  const text = (value) => (value == null || value === '' ? labels.profile.missing : String(value));
  const category = vehicle?.category ? (labels.registration.vehicleCategory[vehicle.category] ?? vehicle.category) : null;
  const vehicleColor = vehicle?.color ? (labels.registration.vehicleColor[vehicle.color] ?? vehicle.color) : null;
  const email = maskEmail(documents?.mercadoPagoEmail);
  const statusText =
    accountStatus === ACCOUNT_STATUS.APPROVED ? labels.profile.accountStatus.approved : labels.profile.accountStatus.pending;

  let body;
  if (accountStatus === ACCOUNT_STATUS.ERROR) {
    body = <ScreenState kind="error" message={labels.profile.errorMessage} onRetry={retryAccountStatus} />;
  } else if (!driverProfile) {
    body =
      accountStatus === ACCOUNT_STATUS.LOADING ? (
        <ScreenState kind="loading" />
      ) : (
        <ScreenState kind="empty" title={labels.profile.emptyTitle} message={labels.profile.emptyMessage} />
      );
  } else {
    body = (
      <>
        {/* AI-assisted: see docs/AI_LOG.md #53 */}
        <Card style={styles.hero}>
          {personal?.profilePhotoUrl ? (
            <Image
              testID="profile-photo"
              source={{ uri: personal.profilePhotoUrl }}
              accessibilityLabel={labels.profile.photoA11y}
              style={styles.photo}
            />
          ) : (
            <View style={[styles.photo, styles.noPhoto]} accessible accessibilityLabel={labels.profile.noPhoto}>
              <Icon name="person" size={iconSize.lg} tint={color.onPrimarySoft} />
            </View>
          )}
          <Text style={styles.heroName}>{text(personal?.fullName)}</Text>
          {category ? <Chip label={category} tone="brand" /> : null}
        </Card>
        <Group title={labels.profile.personal}>
          <Field label={labels.profile.name} value={text(personal?.fullName)} />
          <Field label={labels.profile.phone} value={text(personal?.phone)} last />
        </Group>
        <Group title={labels.profile.vehicle}>
          <Field label={labels.profile.brandModel} value={text([vehicle?.brand, vehicle?.model].filter(Boolean).join(' '))} />
          <Field label={labels.profile.plate} value={text(vehicle?.plate)} />
          <Field label={labels.profile.year} value={text(vehicle?.year)} />
          <Field label={labels.profile.color} value={text(vehicleColor)} />
          <Field label={labels.profile.category} value={text(category)} last />
        </Group>
        <Group title={labels.profile.payments}>
          <Field label={labels.profile.mercadoPago} value={text(email)} last />
        </Group>
        <Group title={labels.profile.account}>
          <Field label={labels.profile.account} value={statusText} last />
        </Group>
        <Text style={styles.muted}>{labels.profile.readOnly}</Text>
      </>
    );
  }

  return (
    <PlaceholderScreen
      name="profile"
      title={labels.drawer.profile}
      leading="drawer"
      onLeadingPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.stack}>{body}</View>
    </PlaceholderScreen>
  );
}

function Group({ title, children }) {
  return (
    <Card style={styles.group}>
      <Text style={styles.section} accessibilityRole="header">
        {title}
      </Text>
      <View>{children}</View>
    </Card>
  );
}

function Field({ label, value, last = false }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`}>
      <DataRow label={label} value={value} last={last} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space[3] },
  hero: { alignItems: 'center', gap: space[2] },
  photo: {
    width: avatarSize.md,
    height: avatarSize.md,
    borderRadius: radius.full,
    borderWidth: borderWidth.thick,
    borderColor: color.primary,
    backgroundColor: color.primarySoft,
  },
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  heroName: { ...type.title, color: color.text, textAlign: 'center' },
  group: { gap: space[2] },
  section: { ...type.title, color: color.text },
  muted: { ...type.caption, color: color.textMuted },
});
