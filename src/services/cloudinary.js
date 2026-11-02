// AI-assisted: see docs/AI_LOG.md #25

export class CloudinaryUploadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

// Uploads a local photo URI to Cloudinary using an unsigned upload preset (no secret involved:
// an unsigned preset is designed to be used from the client). Returns the resulting secure_url.
export async function uploadPhotoAsync(localUri) {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', { uri: localUri, type: 'image/jpeg', name: 'photo.jpg' });
  formData.append('upload_preset', uploadPreset);

  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new CloudinaryUploadError('No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.');
  }

  if (!response.ok) {
    throw new CloudinaryUploadError('No se pudo subir la foto. Inténtalo de nuevo.');
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new CloudinaryUploadError('No se pudo subir la foto. Inténtalo de nuevo.');
  }

  return data.secure_url;
}
