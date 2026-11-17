// AI-assisted: see AI_LOG.md #60
// Writes the four editable profile fields to drivers/{uid} using dotted paths only, so
// the rest of the document (accountStatus, category, plate, other documents) is never touched.
// Firestore functions are injected so the logic can be tested against a fake.
const EXPECTED_FIELDS = ['fullName', 'phone', 'vehicleColor', 'payoutEmail'];

export function createProfileUpdater({ doc, updateDoc, serverTimestamp, db }) {
  return async function updateDriverProfile(uid, payload) {
    if (typeof uid !== 'string' || uid.length === 0) throw new Error('updateDriverProfile: uid is required');
    if (payload === null || typeof payload !== 'object') throw new Error('updateDriverProfile: payload is required');
    const keys = Object.keys(payload);
    const exact =
      keys.length === EXPECTED_FIELDS.length && EXPECTED_FIELDS.every((field) => keys.includes(field));
    if (!exact) throw new Error('updateDriverProfile: payload must contain exactly the four profile fields');
    if (!EXPECTED_FIELDS.every((field) => typeof payload[field] === 'string')) {
      throw new Error('updateDriverProfile: every profile field must be a string');
    }
    const ref = doc(db, 'drivers', uid);
    await updateDoc(ref, {
      'personalData.fullName': payload.fullName,
      'personalData.phone': payload.phone,
      'vehicle.color': payload.vehicleColor,
      'documents.mercadoPagoEmail': payload.payoutEmail,
      updatedAt: serverTimestamp(),
    });
  };
}
