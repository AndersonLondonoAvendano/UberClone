// AI-assisted: see AI_LOG.md #25
// AI-assisted: see AI_LOG.md #54
import { initializeApp } from 'firebase/app';
// `firebase/auth` (el paquete envoltorio) NO declara una condición "react-native" en su
// package.json para "./auth" (solo node/browser/default) y por eso Metro nunca llega a la
// build de React Native que exporta getReactNativePersistence; `@firebase/auth` SÍ la declara
// (verificado en node_modules/@firebase/auth/package.json y dist/rn/index.rn.d.ts). Se importa
// de ahí directamente para que Metro resuelva la condición "react-native" correctamente.
import { initializeAuth, getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
