// AI-assisted: see docs/AI_LOG.md #26
// AI-assisted: see docs/AI_LOG.md #29
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #38
// Verified against node_modules/expo-image-picker/build/{ImagePicker,ImagePicker.types}.d.ts (v57.0.20):
// launchCameraAsync/launchImageLibraryAsync resolve { canceled, assets } (assets[0].uri/base64/mimeType
// on success, base64 only when the base64 option is true); requestCameraPermissionsAsync/
// requestMediaLibraryPermissionsAsync resolve { granted }; mediaTypes takes an array of MediaType
// ('images'), the non-deprecated option.
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import { borderWidth, color, opacity, radius, space, touch, type } from '../../theme/tokens';
import { labels } from '../../constants/labels';
import { uploadPhotoAsync } from '../../services/cloudinary';
import { FieldError } from './FieldError';

export function PhotoField({ testID, label, value, onChange, errorTestID, errorMessage, disabled = false }) {
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading'
  const [permissionError, setPermissionError] = useState(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState(null);

  async function pickAndUpload(requestPermission, launch) {
    setPermissionError(null);
    setUploadErrorMessage(null);

    const permission = await requestPermission();
    if (!permission.granted) {
      setPermissionError(labels.registration.photo.permissionDenied);
      return;
    }

    const result = await launch({ mediaTypes: ['images'], quality: 0.7, base64: true });
    if (result.canceled) return;

    setUploadState('uploading');
    try {
      const secureUrl = await uploadPhotoAsync({
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType,
      });
      setUploadState('idle');
      onChange(secureUrl);
    } catch (error) {
      setUploadState('idle');
      setUploadErrorMessage(error.message);
    }
  }

  const handleCamera = () => pickAndUpload(requestCameraPermissionsAsync, launchCameraAsync);
  const handleGallery = () => pickAndUpload(requestMediaLibraryPermissionsAsync, launchImageLibraryAsync);
  const combinedError = errorMessage || permissionError || uploadErrorMessage;
  // AI-assisted: see docs/AI_LOG.md #38
  const canRemove = Boolean(value) && uploadState !== 'uploading' && !disabled;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.preview, !value && styles.previewEmpty, combinedError && styles.previewError]}>
        {value ? (
          <Image source={{ uri: value }} style={styles.previewImage} />
        ) : uploadState === 'uploading' ? (
          <ActivityIndicator accessibilityLabel={labels.registration.photo.uploading} />
        ) : (
          <Text style={styles.previewPlaceholder}>{labels.registration.photo.instruction}</Text>
        )}
        {canRemove ? (
          <Pressable
            testID={`${testID}-remove`}
            accessibilityRole="button"
            accessibilityLabel={labels.registration.photo.removePhoto}
            onPress={() => onChange('')}
            hitSlop={{ top: space[2], bottom: space[2], left: space[2], right: space[2] }}
            style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
          >
            <Text style={styles.removeButtonIcon}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable
          testID={`${testID}-camera`}
          accessibilityRole="button"
          accessibilityLabel={labels.registration.photo.camera}
          onPress={handleCamera}
          disabled={disabled}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed, disabled && styles.actionButtonDisabled]}
        >
          <Text style={styles.actionLabel}>{labels.registration.photo.camera}</Text>
        </Pressable>
        <Pressable
          testID={`${testID}-gallery`}
          accessibilityRole="button"
          accessibilityLabel={labels.registration.photo.gallery}
          onPress={handleGallery}
          disabled={disabled}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed, disabled && styles.actionButtonDisabled]}
        >
          <Text style={styles.actionLabel}>{labels.registration.photo.gallery}</Text>
        </Pressable>
      </View>
      <FieldError testID={errorTestID} message={combinedError} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: space[2],
  },
  fieldLabel: {
    ...type.label,
    color: color.text,
  },
  preview: {
    minHeight: touch.controlHeight * 2,
    borderRadius: radius.sm,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[3],
  },
  previewEmpty: {
    borderStyle: 'dashed',
  },
  previewError: {
    borderColor: color.danger,
  },
  previewImage: {
    width: '100%',
    height: touch.controlHeight * 2,
    borderRadius: radius.sm,
  },
  previewPlaceholder: {
    ...type.caption,
    color: color.textMuted,
    textAlign: 'center',
  },
  // No semi-transparent overlay token exists in tokens.js (same gap already noted in
  // SelectField.js's backdrop), so this reuses an existing solid token instead of inventing a new
  // color: color.text is dark and gives white text full AA contrast without any new design value.
  removeButton: {
    position: 'absolute',
    top: space[2],
    right: space[2],
    width: space[6],
    height: space[6],
    borderRadius: radius.full,
    backgroundColor: color.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    opacity: opacity.pressed,
  },
  removeButtonIcon: {
    ...type.label,
    color: color.onPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: touch.gap,
  },
  actionButton: {
    flex: 1,
    minHeight: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: borderWidth.thin,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  actionButtonPressed: {
    opacity: opacity.pressed,
  },
  actionButtonDisabled: {
    opacity: opacity.disabled,
  },
  actionLabel: {
    ...type.label,
    color: color.text,
  },
});
