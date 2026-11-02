// AI-assisted: see docs/AI_LOG.md #25
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Listens to drivers/{uid}; onChange receives the document's accountStatus, or null
// when the document does not exist yet (treated as "not registered", not an error).
// onError only fires for real read failures (network/permissions).
// Returns the unsubscribe function; the caller must invoke it (e.g. in a useEffect cleanup).
export function listenToDriverAccount(uid, { onChange, onError }) {
  const ref = doc(db, 'drivers', uid);
  const unsubscribe = onSnapshot(
    ref,
    (snapshot) => {
      onChange(snapshot.exists() ? snapshot.data().accountStatus ?? null : null);
    },
    (error) => {
      onError(error);
    },
  );
  return unsubscribe;
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
