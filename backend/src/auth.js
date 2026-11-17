// AI-assisted: see AI_LOG.md #55
// Bearer token verification. adminAuth is firebase-admin's auth() (or a fake in tests).
// Tokens are never logged and never echoed.

export class AuthError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'AuthError';
  }
}

const BEARER = /^Bearer ([^\s]+)$/;

export function createAuth(adminAuth) {
  return {
    // Returns the uid, or throws AuthError (one generic error for every failure).
    async verifyToken(header) {
      const match = typeof header === 'string' ? BEARER.exec(header) : null;
      if (!match) throw new AuthError();
      try {
        const decoded = await adminAuth.verifyIdToken(match[1]);
        if (!decoded || typeof decoded.uid !== 'string' || decoded.uid === '') throw new AuthError();
        return decoded.uid;
      } catch {
        throw new AuthError();
      }
    },
  };
}
