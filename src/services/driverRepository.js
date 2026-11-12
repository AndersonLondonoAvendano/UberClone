// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #34
import { doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { createProfileUpdater } from './profileUpdater';

// Listens to drivers/{uid}; onChange receives the document's accountStatus, or null
// when the document does not exist yet (treated as "not registered", not an error).
// onError only fires for real read failures (network/permissions).
// Returns the unsubscribe function; the caller must invoke it (e.g. in a useEffect cleanup).
// AI-assisted: see docs/AI_LOG.md #50
// The optional onData receives the whole document data (or null) so the profile reuses this same
// subscription instead of opening another one.
export function listenToDriverAccount(uid, { onChange, onError, onData }) {
  const ref = doc(db, 'drivers', uid);
  const unsubscribe = onSnapshot(
    ref,
    (snapshot) => {
      if (onData) onData(snapshot.exists() ? snapshot.data() : null);
      onChange(snapshot.exists() ? snapshot.data().accountStatus ?? null : null);
    },
    (error) => {
      onError(error);
    },
  );
  return unsubscribe;
}

// Reads drivers/{uid} once; returns { personalData, vehicle, documents } when the document
// already exists, or null when it does not (treated as "not registered yet", not an error).
export async function getDriverRegistration(uid) {
  const ref = doc(db, 'drivers', uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const { personalData, vehicle, documents } = snapshot.data();
  return { personalData, vehicle, documents };
}

export async function submitDriverRegistration(uid, { personalData, vehicle, documents }) {
  const ref = doc(db, 'drivers', uid);
  await setDoc(
    ref,
    {
      personalData,
      vehicle,
      documents,
      accountStatus: 'pending',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// AI-assisted: see docs/AI_LOG.md #60
// Saves the editable profile fields (payload from buildProfilePayload) with dotted paths only.
export const updateDriverProfile = createProfileUpdater({ doc, updateDoc, serverTimestamp, db });
