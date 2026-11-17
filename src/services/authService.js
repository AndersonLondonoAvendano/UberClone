// AI-assisted: see AI_LOG.md #54
// Thin wrapper over the Firebase Auth instance of src/services/firebase.js. Errors are rethrown
// untouched (with their `code`) so mapAuthError can translate them. Nothing is logged and the
// email and password are never stored here (Firebase persists only its own session).

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@firebase/auth';
import { auth } from './firebase';

function toLightUser(user) {
  return user ? { uid: user.uid, email: user.email ?? null, isAnonymous: Boolean(user.isAnonymous) } : null;
}

export async function signUpWithEmail(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return { uid: credential.user.uid };
}

export async function signInWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return { uid: credential.user.uid };
}

export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

export function signOutUser() {
  return signOut(auth);
}

// Calls onUser with { uid, email, isAnonymous } or null; returns the unsubscribe function.
export function listenToAuthState(onUser, onError) {
  return onAuthStateChanged(auth, (user) => onUser(toLightUser(user)), onError);
}

// Closes a legacy anonymous session. Resolves true if one was closed.
export async function signOutLegacyAnonymous() {
  const user = auth.currentUser;
  if (!user || !user.isAnonymous) return false;
  await signOut(auth);
  return true;
}

// Aliases with the short names.
export const signUp = signUpWithEmail;
export const signIn = signInWithEmail;
export const subscribeToAuth = listenToAuthState;
