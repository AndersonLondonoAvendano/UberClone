// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// Profile (T-49, read-only): photo, name, phone, vehicle, masked Mercado Pago email and account
// status. The data comes from the drivers/{uid} document through the existing account subscription
// (AppStateContext.driverProfile): no second listener. No editing and no sign-out.

import { DrawerActions } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ScreenState } from '../../components/ScreenState';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { labels } from '../../constants/labels';
import { useAppState } from '../../context/AppStateContext';
import { color, radius, space, touch, type } from '../../theme/tokens';
import { maskEmail } from '../../utils/mask';

const PHOTO_SIZE = 96;

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
        <View style={styles.photoRow}>
          {personal?.profilePhotoUrl ? (
            <Image
              testID="profile-photo"
              source={{ uri: personal.profilePhotoUrl }}
              accessibilityLabel={labels.profile.photoA11y}
              style={styles.photo}
            />
          ) : (
            <View style={[styles.photo, styles.noPhoto]} accessible accessibilityLabel={labels.profile.noPhoto}>
              <Text style={styles.muted}>{labels.profile.noPhoto}</Text>
            </View>
          )}
        </View>
        <Group title={labels.profile.personal}>
          <Field label={labels.profile.name} value={text(personal?.fullName)} />
          <Field label={labels.profile.phone} value={text(personal?.phone)} numeric />
        </Group>
        <Group title={labels.profile.vehicle}>
          <Field label={labels.profile.brandModel} value={text([vehicle?.brand, vehicle?.model].filter(Boolean).join(' '))} />
          <Field label={labels.profile.plate} value={text(vehicle?.plate)} />
          <Field label={labels.profile.year} value={text(vehicle?.year)} numeric />
          <Field label={labels.profile.color} value={text(vehicleColor)} />
          <Field label={labels.profile.category} value={text(category)} />
        </Group>
        <Group title={labels.profile.payments}>
          <Field label={labels.profile.mercadoPago} value={text(email)} />
        </Group>
        <Group title={labels.profile.account}>
          <Field label={labels.profile.account} value={statusText} />
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
    <View style={styles.group}>
      <Text style={styles.section} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
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
  photoRow: { alignItems: 'center' },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: PHOTO_SIZE / 2, backgroundColor: color.surface },
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  group: { gap: space[2], padding: space[4], backgroundColor: color.surface, borderRadius: radius.md },
  section: { ...type.title, color: color.text },
  field: { gap: space[1], minHeight: touch.min, justifyContent: 'center' },
  body: { ...type.body, color: color.text },
  muted: { ...type.caption, color: color.textMuted },
});
