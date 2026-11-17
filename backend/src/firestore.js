// AI-assisted: see AI_LOG.md #58
// Trip access for the payments backend. db is firebase-admin's Firestore (or a fake exposing
// doc(path) and runTransaction(fn); the transaction exposes get(ref) and update(ref, data)).
// Trips live at drivers/{uid}/trips/{tripId}.

const APPROVED = 'approved';
const PAYMENT_STATUSES = ['approved', 'pending', 'rejected'];
const PAYMENT_METHODS = ['mercadopago', 'stripe'];

function tripPath(uid, tripId) {
  return `drivers/${uid}/trips/${tripId}`;
}

export function createTripStore(db) {
  return {
    // Returns the trip data, or null when it does not exist.
    async getTrip(uid, tripId) {
      const snapshot = await db.doc(tripPath(uid, tripId)).get();
      return snapshot.exists ? snapshot.data() : null;
    },

    // Sets the gateway that will charge the trip (and, optionally, the checkout reference to keep in
    // paymentId, e.g. a Stripe session id). Only while the trip is completed and not approved/paid; an
    // approved trip never changes method. Transactional and idempotent: nothing is written when the
    // trip already holds the same values. Returns { ok, applied }: ok is false when the change is refused.
    async setPaymentMethod(uid, tripId, method, { paymentId } = {}) {
      if (!PAYMENT_METHODS.includes(method)) return { ok: false, applied: false };
      const ref = db.doc(tripPath(uid, tripId));
      return db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        if (!snapshot.exists) return { ok: false, applied: false };
        const trip = snapshot.data();
        if (trip.paymentStatus === APPROVED || trip.status === 'paid' || trip.status !== 'completed') {
          return { ok: false, applied: false };
        }
        const update = {};
        if (trip.paymentMethod !== method) update.paymentMethod = method;
        if (typeof paymentId === 'string' && paymentId !== '' && trip.paymentId !== paymentId) update.paymentId = paymentId;
        if (Object.keys(update).length === 0) return { ok: true, applied: false };
        tx.update(ref, update);
        return { ok: true, applied: true };
      });
    },

    // payment = { status: 'approved' | 'pending' | 'rejected', id }. Idempotent, and a trip that is
    // already approved never goes back. Writes only status, paymentStatus and paymentId. provider
    // must equal the trip's paymentMethod: one gateway never approves a trip charged with the other.
    async applyPayment(uid, tripId, payment, provider = 'mercadopago') {
      if (!PAYMENT_STATUSES.includes(payment?.status)) return { applied: false, paymentStatus: null };
      if (!PAYMENT_METHODS.includes(provider)) return { applied: false, paymentStatus: null };
      const ref = db.doc(tripPath(uid, tripId));
      return db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        if (!snapshot.exists) return { applied: false, paymentStatus: null };
        const trip = snapshot.data();
        if (trip.paymentMethod !== provider) return { applied: false, paymentStatus: trip.paymentStatus ?? null };
        if (trip.paymentStatus === APPROVED || trip.status === 'paid') {
          return { applied: false, paymentStatus: APPROVED };
        }
        if (trip.status !== 'completed') return { applied: false, paymentStatus: trip.paymentStatus ?? null };

        const sameState = trip.paymentStatus === payment.status && trip.paymentId === String(payment.id);
        if (sameState) return { applied: false, paymentStatus: payment.status };

        const update = { paymentStatus: payment.status, paymentId: String(payment.id) };
        if (payment.status === APPROVED) update.status = 'paid';
        tx.update(ref, update);
        return { applied: true, paymentStatus: payment.status };
      });
    },
  };
}
