// AI-assisted: see docs/AI_LOG.md #72
// Last availability seq used by this device (D-199). It is a device counter, not personal data, so it is
// NOT cleared on sign-out: keeping it growing across restarts and reinstalls is what stops the backend from
// ignoring a fresh app whose clock is behind the last seq it accepted. Storage is injected (AsyncStorage in
// the app), so a script can test it. It never throws: a failing read gives 0 and a failing write gives false.

export const AVAILABILITY_SEQ_KEY = 'availabilityLastSeq';

export function createSeqStore({ storage, key = AVAILABILITY_SEQ_KEY }) {
  let highest = 0; // greatest value this store has been asked to write
  let chain = Promise.resolve(); // writes run one after another, so an older value never lands last

  return {
    // Resolves the stored seq as a safe integer >= 0 (0 when nothing valid is stored or the read fails).
    async load() {
      try {
        const raw = await storage.getItem(key);
        const value = typeof raw === 'string' && /^\d{1,16}$/.test(raw) ? Number(raw) : 0;
        return Number.isSafeInteger(value) ? value : 0;
      } catch {
        return 0;
      }
    },
    // Stores `seq` only when it is greater than everything written so far. Resolves true when written.
    save(seq) {
      if (!Number.isSafeInteger(seq) || seq <= highest) return Promise.resolve(false);
      highest = seq;
      const write = chain.then(async () => {
        try {
          await storage.setItem(key, String(seq));
          return true;
        } catch {
          return false;
        }
      });
      chain = write;
      return write;
    },
  };
}

// AsyncStorage is loaded on first use, never at import time.
const lazyStorage = {
  getItem: (k) => require('@react-native-async-storage/async-storage').default.getItem(k),
  setItem: (k, v) => require('@react-native-async-storage/async-storage').default.setItem(k, v),
};

export const availabilitySeqStore = createSeqStore({ storage: lazyStorage });
