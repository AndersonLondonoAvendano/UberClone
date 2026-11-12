// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #50
// AI-assisted: see docs/AI_LOG.md #53 (presentation: bordered avatar, category chip, DataRow groups)
// AI-assisted: see docs/AI_LOG.md #60 (R13: per-field edit for name, phone, vehicle color and payout email)
// Profile: photo, name, phone, vehicle, masked payout email and account status. The data comes from
// the drivers/{uid} document through the existing account subscription
// (AppStateContext.driverProfile): no second listener. Each of the four editable fields has its own
// pencil (one field at a time, via useProfileEdit); the rest is read-only. Inline messages, no dialogs.
// No sign-out here.

import { DrawerActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { DataRow } from '../../components/DataRow';
import { EditableFieldRow } from '../../components/EditableFieldRow';
import { Icon } from '../../components/Icon';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenState } from '../../components/ScreenState';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SelectField } from '../../components/registration/SelectField';
import { TextField } from '../../components/registration/TextField';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { labels } from '../../constants/labels';
import { VEHICLE_COLOR_OPTIONS } from '../../constants/registrationOptions';
import { useAppState } from '../../context/AppStateContext';
import { useProfileEdit } from '../../hooks/useProfileEdit';
import { avatarSize, borderWidth, color, iconSize, radius, space, type } from '../../theme/tokens';
import { maskEmail } from '../../utils/mask';

const PHONE_MAX_LENGTH = 10;
const EMAIL_INPUT_PROPS = { autoCapitalize: 'none', autoCorrect: false, autoComplete: 'email' };

export function ProfileScreen({ navigation }) {
  const { driverId, driverProfile, accountStatus, retryAccountStatus } = useAppState();
  const personal = driverProfile?.personalData;
  const vehicle = driverProfile?.vehicle;
  const documents = driverProfile?.documents;
  const text = (value) => (value == null || value === '' ? labels.profile.missing : String(value));
  const category = vehicle?.category ? (labels.registration.vehicleCategory[vehicle.category] ?? vehicle.category) : null;
  const vehicleColor = vehicle?.color ? (labels.registration.vehicleColor[vehicle.color] ?? vehicle.color) : null;
  const email = maskEmail(documents?.mercadoPagoEmail);
  const edit = useProfileEdit(driverId, driverProfile);
  const editing = edit.state?.mode === 'edit';
  const { discard } = edit;
  // Which field is open for editing. The flow loads the four drafts at once; the screen only shows the
  // active one. Derived from the flow mode, so cancel, save, blur and account change clear it.
  const [pickedField, setPickedField] = useState(null);
  const activeField = editing ? pickedField : null;
  const startEdit = (field) => {
    setPickedField(field);
    edit.start();
  };

  // Leaving Profile (the drawer keeps it mounted) discards unsaved changes.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', discard);
    return unsubscribe;
  }, [navigation, discard]);
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
    const draft = edit.state?.draft;
    const errors = edit.state?.errors ?? {};
    const saving = edit.state?.phase === 'saving';
    const failed = edit.state?.phase === 'error';
    const fieldError = (field) => (errors[field] ? labels.profile.errors[field] : undefined);
    // One field at a time: while one is active the other pencils are disabled (nothing is discarded
    // silently). Cancel or a successful save returns the screen to read mode.
    const rowProps = (field, label, value, testID) => ({
      label,
      value,
      testID,
      editing: activeField === field,
      disabled: editing,
      onEdit: () => startEdit(field),
      editLabel: `${labels.profile.edit.editField} ${label.toLowerCase()}`,
      editHint: editing ? labels.profile.edit.editBusyHint : labels.profile.edit.editFieldHint,
    });
    const actions = (
      <View style={styles.actions}>
        {failed ? (
          <PrimaryButton
            testID="profile-retry"
            label={labels.profile.edit.retry}
            accessibilityHint={labels.profile.edit.retryHint}
            onPress={edit.retry}
          />
        ) : (
          <PrimaryButton
            testID="profile-save"
            label={labels.profile.edit.save}
            accessibilityHint={labels.profile.edit.saveHint}
            disabled={!edit.state?.canSave || saving}
            onPress={edit.submit}
          />
        )}
        <SecondaryButton
          testID="profile-cancel"
          label={labels.profile.edit.cancel}
          accessibilityHint={labels.profile.edit.cancelHint}
          disabled={saving}
          onPress={edit.cancel}
        />
      </View>
    );
    body = (
      <>
        <StatusRegion phase={edit.state?.phase} />
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
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{text(personal?.fullName)}</Text>
            {category ? (
              <View style={styles.heroChip}>
                <Chip label={category} tone="brand" />
              </View>
            ) : null}
          </View>
        </Card>
        <Group title={labels.profile.personal}>
          <EditableFieldRow {...rowProps('fullName', labels.profile.name, text(personal?.fullName), 'profile-edit-name-pencil')}>
            <TextField
              testID="profile-edit-name"
              label={labels.profile.name}
              value={draft?.fullName ?? ''}
              onChangeText={(value) => edit.change('fullName', value)}
              onBlur={() => edit.touch('fullName')}
              errorTestID="profile-edit-name-error"
              errorMessage={fieldError('fullName')}
              disabled={saving}
              announceError
            />
            {actions}
          </EditableFieldRow>
          <EditableFieldRow {...rowProps('phone', labels.profile.phone, text(personal?.phone), 'profile-edit-phone-pencil')} last>
            <TextField
              testID="profile-edit-phone"
              label={labels.profile.phone}
              value={draft?.phone ?? ''}
              onChangeText={(value) => edit.change('phone', value)}
              onBlur={() => edit.touch('phone')}
              errorTestID="profile-edit-phone-error"
              errorMessage={fieldError('phone')}
              keyboardType="number-pad"
              maxLength={PHONE_MAX_LENGTH}
              disabled={saving}
              announceError
            />
            {actions}
          </EditableFieldRow>
        </Group>
        <Group title={labels.profile.vehicle}>
          <Field label={labels.profile.brandModel} value={text([vehicle?.brand, vehicle?.model].filter(Boolean).join(' '))} />
          <Field label={labels.profile.plate} value={text(vehicle?.plate)} />
          <Field label={labels.profile.year} value={text(vehicle?.year)} />
          <EditableFieldRow {...rowProps('vehicleColor', labels.profile.color, text(vehicleColor), 'profile-edit-color-pencil')}>
            <SelectField
              testID="profile-edit-color"
              label={labels.profile.color}
              options={VEHICLE_COLOR_OPTIONS}
              value={draft?.vehicleColor ?? ''}
              onChange={(value) => edit.change('vehicleColor', value)}
              errorTestID="profile-edit-color-error"
              errorMessage={fieldError('vehicleColor')}
              disabled={saving}
            />
            {actions}
          </EditableFieldRow>
          <Field label={labels.profile.category} value={text(category)} last />
        </Group>
        <Group title={labels.profile.payments}>
          <EditableFieldRow {...rowProps('payoutEmail', labels.profile.payoutEmail, text(email), 'profile-edit-email-pencil')} last>
            <TextField
              testID="profile-edit-email"
              label={labels.profile.payoutEmail}
              value={draft?.payoutEmail ?? ''}
              onChangeText={(value) => edit.change('payoutEmail', value)}
              onBlur={() => edit.touch('payoutEmail')}
              errorTestID="profile-edit-email-error"
              errorMessage={fieldError('payoutEmail')}
              helperText={labels.profile.payoutEmailHelp}
              keyboardType="email-address"
              inputProps={EMAIL_INPUT_PROPS}
              disabled={saving}
              announceError
            />
            {actions}
          </EditableFieldRow>
        </Group>
        <Group title={labels.profile.account}>
          <Field label={labels.profile.accountRow} value={statusText} last />
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

// One polite live region for saving / saved / network error. It is always mounted so the screen
// reader announces the changes; each state pairs an icon with text (never colour alone).
function StatusRegion({ phase }) {
  let content = null;
  if (phase === 'saving') {
    content = <Text style={styles.statusText}>{labels.profile.status.saving}</Text>;
  } else if (phase === 'saved') {
    content = (
      <View style={styles.statusRow}>
        <Icon name="checkmark" size={iconSize.md} tint={color.success} />
        <Text style={styles.statusText}>{labels.profile.status.saved}</Text>
      </View>
    );
  } else if (phase === 'error') {
    content = (
      <View style={styles.statusRow}>
        <Icon name="alert-circle" size={iconSize.md} tint={color.danger} />
        <Text testID="profile-save-error" style={styles.errorText}>
          {labels.profile.status.networkError}
        </Text>
      </View>
    );
  }
  return (
    <View testID="profile-status" accessibilityLiveRegion="polite">
      {content}
    </View>
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
  hero: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  heroInfo: { flex: 1, flexShrink: 1, gap: space[2] },
  heroChip: { alignSelf: 'flex-start' },
  photo: {
    width: avatarSize.md,
    height: avatarSize.md,
    borderRadius: radius.full,
    borderWidth: borderWidth.thick,
    borderColor: color.primary,
    backgroundColor: color.primarySoft,
  },
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  heroName: { ...type.title, color: color.text },
  group: { gap: space[2] },
  section: { ...type.title, color: color.text },
  muted: { ...type.caption, color: color.textMuted },
  actions: { gap: space[2] },
  statusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  statusText: { ...type.small, color: color.text, flexShrink: 1 },
  errorText: { ...type.small, color: color.danger, flex: 1, flexShrink: 1 },
});
