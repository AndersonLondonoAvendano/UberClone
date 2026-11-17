// AI-assisted: see docs/AI_LOG.md #67
// English dictionary, `registration` section (T-249). `registrationFlow` lives in en/app.js (T-248).
// Stored values (document type, city, categories) are unchanged: only what is shown is translated.
// profile.errors in English (T-247, en/account.js) must repeat the same texts as the four `error` strings
// of fullName, phone, vehicle color and mercadoPagoEmail below.
export const enRegistration = {
  registration: {
    pendingNotice: "Pending approval. While your account is being reviewed, you can't edit or resubmit your registration.",
    gender: {
      femenino: 'Female',
      masculino: 'Male',
      otro: 'Other',
      prefieroNoDecir: 'Prefer not to say',
    },
    language: {
      es: 'Español',
      en: 'English',
    },
    vehicleCategory: {
      economico: 'Economy',
      xl: 'XL',
      premium: 'Premium',
    },
    vehicleColor: {
      blanco: 'White',
      negro: 'Black',
      gris: 'Gray',
      plata: 'Silver',
      rojo: 'Red',
      azul: 'Blue',
      verde: 'Green',
      amarillo: 'Yellow',
      otro: 'Other',
    },
    unselected: 'not selected',
    photo: {
      instruction: 'Choose a photo with the camera or the gallery.',
      camera: 'Camera',
      gallery: 'Gallery',
      uploading: 'Uploading photo',
      permissionDenied: 'We need your permission to continue. Check the app permissions and try again.',
      removePhoto: 'Remove photo',
    },
    personalData: {
      fields: {
        profilePhotoUrl: { label: 'Profile photo', error: 'Choose a profile photo with the camera or the gallery.' },
        fullName: { label: 'Full name', error: 'Enter your full name (up to 50 letters, letters and spaces only).' },
        documentNumber: { label: 'Document number', error: 'Enter a valid document number (6 to 10 digits).' },
        phone: { label: 'Mobile phone', error: 'Enter a valid 10-digit mobile number.' },
        birthDate: { label: 'Date of birth', error: 'Choose your date of birth; you must be over 18.' },
        gender: { label: 'Gender', error: 'Select an option.' },
        email: { label: 'Email', error: 'Enter a valid email, with @ and a domain.' },
        language: { label: 'Language', error: 'Select a language.' },
      },
    },
    vehicle: {
      fields: {
        category: { label: 'Category', error: 'Select a category.' },
        plate: { label: 'License plate', error: 'Enter a valid plate in the ABC123 format.' },
        brand: { label: 'Make', error: 'Enter the vehicle make (up to 30 characters).' },
        model: { label: 'Model', error: 'Enter the vehicle model (up to 30 characters).' },
        year: { label: 'Year', error: 'Enter a valid year (4 digits, not later than the current year).' },
        color: { label: 'Color', error: 'Select a color.' },
        capacity: { label: 'Capacity', error: 'Enter a valid capacity (at least 6 for the XL category).' },
        photoUrl: { label: 'Vehicle photo (plate visible)', error: 'Choose a photo of the vehicle with the plate visible, using the camera or the gallery.' },
      },
    },
    documents: {
      fields: {
        mercadoPagoEmail: {
          label: 'Payout email',
          help: 'Email linked to your payment gateway account. For information only in this version.',
          error: 'Enter a valid email, with @ and a domain.',
        },
        termsAccepted: { error: 'You must accept the terms to continue.' },
        licenseNumber: { label: "Driver's license number", error: 'Enter a valid license number (5 to 20 letters or numbers).' },
        licensePhotoUrl: { label: "Photo of the driver's license", error: "Choose a photo of your license with the camera or the gallery." },
        licenseExpiresAt: { label: 'License expiration', error: 'Choose an expiration date after today.' },
        soatPhotoUrl: { label: 'SOAT photo', error: 'Choose a photo of your SOAT with the camera or the gallery.' },
        soatExpiresAt: { label: 'SOAT expiration', error: 'Choose an expiration date after today.' },
        technicalReviewPhotoUrl: { label: 'Photo of the technical inspection', error: 'Choose a photo of your technical inspection with the camera or the gallery.' },
        technicalReviewExpiresAt: { label: 'Technical inspection expiration', error: 'Choose an expiration date after today.' },
      },
      sections: {
        license: "Driver's license",
        soat: 'SOAT',
        technicalReview: 'Technical inspection',
        payments: 'Payments and terms',
      },
      validation: {
        expiryInvalid: 'Choose an expiration date after today.',
        licenseNumberInvalid: 'Enter a valid license number (5 to 20 letters or numbers).',
        technicalReviewNotRequired: 'Not required: your vehicle is less than 5 years old.',
      },
      termsLabel: 'I accept the terms and conditions. The platform keeps a {percent}% commission on every trip.',
      submit: 'Submit registration',
      submitting: 'Submitting…',
      submitSuccess: 'Registration submitted. Your account is pending approval.',
      submitError: "We couldn't submit your registration. Check your connection and try again.",
      submitErrors: {
        'permission-denied': "We couldn't submit your registration because of an account permissions problem. Sign out and try again.",
        unavailable: 'There is no connection to the server. Check your internet and try again.',
        'deadline-exceeded': 'The connection took too long. Check your internet and try again.',
        unauthenticated: 'Your session expired. Sign in again.',
      },
    },
  },
};
