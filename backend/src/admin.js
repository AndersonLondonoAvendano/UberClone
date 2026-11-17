// AI-assisted: see docs/AI_LOG.md #55
// Real firebase-admin initialization, kept apart so tests never load it.
import { readFileSync } from 'node:fs';

export async function initAdmin(config) {
  const { initializeApp, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getMessaging } = await import('firebase-admin/messaging');
  const serviceAccount = JSON.parse(readFileSync(config.serviceAccountPath, 'utf8'));
  const app = initializeApp({ credential: cert(serviceAccount) });
  return { adminAuth: getAuth(app), db: getFirestore(app), messaging: getMessaging(app) };
}
