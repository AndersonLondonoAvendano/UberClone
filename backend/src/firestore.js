// AI-assisted: see docs/AI_LOG.md #55
// Trip access for the payments backend. db is firebase-admin's Firestore (or a fake exposing
// doc(path) and runTransaction(fn); the transaction exposes get(ref) and update(ref, data)).
// Trips live at drivers/{uid}/trips/{tripId}.

const APPROVED = 'approved';
const PAYMENT_STATUSES = ['approved', 'pending', 'rejected'];

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

    // payment = { status: 'approved' | 'pending' | 'rejected', id }. Idempotent, and a trip that is
    // already approved never goes back. Writes only status, paymentStatus and paymentId.
    async applyPayment(uid, tripId, payment) {
      if (!PAYMENT_STATUSES.includes(payment?.status)) return { applied: false, paymentStatus: null };
      const ref = db.doc(tripPath(uid, tripId));
      return db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        if (!snapshot.exists) return { applied: false, paymentStatus: null };
        const trip = snapshot.data();
        if (trip.paymentMethod !== 'mercadopago') return { applied: false, paymentStatus: trip.paymentStatus ?? null };
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
