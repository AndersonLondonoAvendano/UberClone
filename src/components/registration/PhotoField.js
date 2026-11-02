// AI-assisted: see docs/AI_LOG.md #26
// AI-assisted: see docs/AI_LOG.md #29
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

export function PhotoField({ testID, label, value, onChange, errorTestID, errorMessage }) {
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

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.preview}>
        {value ? (
          <Image source={{ uri: value }} style={styles.previewImage} />
        ) : uploadState === 'uploading' ? (
          <ActivityIndicator accessibilityLabel={labels.registration.photo.uploading} />
        ) : (
          <Text style={styles.previewPlaceholder}>{labels.registration.photo.instruction}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable
          testID={`${testID}-camera`}
          accessibilityRole="button"
          accessibilityLabel={labels.registration.photo.camera}
          onPress={handleCamera}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionLabel}>{labels.registration.photo.camera}</Text>
        </Pressable>
        <Pressable
          testID={`${testID}-gallery`}
          accessibilityRole="button"
          accessibilityLabel={labels.registration.photo.gallery}
          onPress={handleGallery}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
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
  actionLabel: {
    ...type.label,
    color: color.text,
  },
});
