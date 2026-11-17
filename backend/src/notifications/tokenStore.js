// AI-assisted: see AI_LOG.md #64
// push tokens at pushTokens/{sha256(token)}: { uid, token, platform, createdAt, updatedAt }. Only the Admin SDK
// touches this collection (no Firestore rules, no index). db is firebase-admin's Firestore or a fake exposing
// collection(name).doc(id), collection(name).where(field, op, value).get() and runTransaction(fn).
import { createHash } from 'node:crypto';
import { PUSH_TOKEN_MAX_LENGTH, PUSH_TOKEN_MIN_LENGTH } from '../config.js';

const COLLECTION = 'pushTokens';
const PLATFORM = 'android';

export function isValidPushToken(token) {
  return (
    typeof token === 'string' &&
    token.length >= PUSH_TOKEN_MIN_LENGTH &&
    token.length <= PUSH_TOKEN_MAX_LENGTH &&
    !/\s/.test(token)
  );
}

export function isValidPlatform(platform) {
  return platform === PLATFORM;
}

export function tokenId(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createTokenStore({ db, now = () => Date.now() }) {
  const ref = (token) => db.collection(COLLECTION).doc(tokenId(token));

  return {
    // Idempotent. A token already stored for another uid is reassigned to the caller (D-131); createdAt is kept.
    async register(uid, token, platform) {
      if (!isValidPushToken(token) || !isValidPlatform(platform)) throw new TypeError('invalid token');
      const docRef = ref(token);
      await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(docRef);
        const time = now();
        const createdAt = snapshot.exists ? (snapshot.data().createdAt ?? time) : time;
        tx.set(docRef, { uid, token, platform: PLATFORM, createdAt, updatedAt: time });
      });
    },

    // Deletes only when the document belongs to uid; a missing or foreign token gives the same result.
    async unregister(uid, token) {
      if (!isValidPushToken(token)) throw new TypeError('invalid token');
      const docRef = ref(token);
      await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(docRef);
        if (snapshot.exists && snapshot.data().uid === uid) tx.delete(docRef);
      });
    },

    async listForUid(uid) {
      const snapshot = await db.collection(COLLECTION).where('uid', '==', uid).get();
      return snapshot.docs.map((doc) => doc.data().token).filter((token) => typeof token === 'string');
    },

    // Cleanup of tokens FCM reported as no longer valid.
    async removeTokens(tokens) {
      await Promise.all(tokens.map((token) => ref(token).delete()));
    },
  };
}
