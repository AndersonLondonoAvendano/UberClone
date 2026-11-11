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
import { borderWidth, color, iconSize, opacity, photoPreviewHeight, radius, space, touch, type } from '../../theme/tokens';
import { labels } from '../../constants/labels';
import { uploadPhotoAsync } from '../../services/cloudinary';
import { Icon } from '../Icon';
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
      {/* AI-assisted: see docs/AI_LOG.md #53 (framed preview, icon states, visible remove button) */}
      <View style={[styles.preview, !value && styles.previewEmpty, combinedError && styles.previewError]}>
        {value ? (
          <Image source={{ uri: value }} style={styles.previewImage} />
        ) : uploadState === 'uploading' ? (
          <View style={styles.previewState}>
            <ActivityIndicator accessibilityLabel={labels.registration.photo.uploading} color={color.primary} />
            <Text style={styles.previewPlaceholder}>{labels.registration.photo.uploading}</Text>
          </View>
        ) : (
          <View style={styles.previewState}>
            <Icon name="camera-outline" size={iconSize.lg} tint={color.textMuted} />
            <Text style={styles.previewPlaceholder}>{labels.registration.photo.instruction}</Text>
          </View>
        )}
      </View>
      {canRemove ? (
        <Pressable
          testID={`${testID}-remove`}
          accessibilityRole="button"
          accessibilityLabel={labels.registration.photo.removePhoto}
          onPress={() => onChange('')}
          style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
        >
          <Icon name="trash-outline" size={iconSize.md} tint={color.danger} />
          <Text style={styles.removeButtonLabel}>{labels.registration.photo.removePhoto}</Text>
        </Pressable>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          testID={`${testID}-camera`}
          accessibilityRole="button"
          accessibilityLabel={labels.registration.photo.camera}
          onPress={handleCamera}
          disabled={disabled}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed, disabled && styles.actionButtonDisabled]}
        >
          <Icon name="camera-outline" size={iconSize.md} tint={color.text} />
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
          <Icon name="images-outline" size={iconSize.md} tint={color.text} />
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
    minHeight: photoPreviewHeight,
    borderRadius: radius.md,
    borderWidth: borderWidth.thick,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewEmpty: {
    borderStyle: 'dashed',
    backgroundColor: color.surfaceMuted,
    padding: space[4],
  },
  previewError: {
    borderColor: color.danger,
  },
  previewImage: {
    width: '100%',
    height: photoPreviewHeight,
  },
  previewState: {
    alignItems: 'center',
    gap: space[2],
  },
  previewPlaceholder: {
    ...type.small,
    color: color.textMuted,
    textAlign: 'center',
  },
  removeButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: touch.min,
    paddingHorizontal: space[3],
  },
  removeButtonPressed: {
    opacity: opacity.pressed,
  },
  removeButtonLabel: {
    ...type.label,
    color: color.danger,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: touch.gap,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    gap: space[2],
    minHeight: touch.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: borderWidth.thick,
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
    ...type.bodyStrong,
    color: color.text,
  },
});
