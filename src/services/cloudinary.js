// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #29

export class CloudinaryUploadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

// ~8 MB of base64 text: a client-side guard before attempting the upload, not a Cloudinary limit.
// The data URI itself is always larger than the original image file.
const MAX_BASE64_LENGTH = 8 * 1024 * 1024;

// Uploads a photo to Cloudinary using an unsigned upload preset (no secret involved: an unsigned
// preset is designed to be used from the client). The file part is sent as a base64 data URI
// string, not the classic { uri, type, name } descriptor: Expo's global fetch only accepts
// FormData parts that are strings, Blobs, or objects with .bytes(), and rejects that descriptor
// with "Unsupported FormDataPart implementation". Returns the resulting secure_url.
export async function uploadPhotoAsync({ base64, mimeType }) {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!base64 || base64.length > MAX_BASE64_LENGTH) {
    throw new CloudinaryUploadError('La foto es demasiado grande. Prueba con una foto de menor calidad o tamaño.');
  }

  const formData = new FormData();
  formData.append('file', `data:${mimeType || 'image/jpeg'};base64,${base64}`);
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

  let data;
  try {
    data = await response.json();
  } catch {
    throw new CloudinaryUploadError('No se pudo subir la foto. Inténtalo de nuevo.');
  }
  if (!data.secure_url) {
    throw new CloudinaryUploadError('No se pudo subir la foto. Inténtalo de nuevo.');
  }

  return data.secure_url;
}
