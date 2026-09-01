const { db, COLLECTIONS } = require('./firestoreService');
const admin = require('firebase-admin');

/**
 * Writes one audit event to incidents/{incidentId}/history/{eventId}.
 * This is the traceability layer required by the project brief: every
 * authority action on an incident must be recorded.
 */
async function recordEvent(incidentId, event) {
  const ref = db()
    .collection(COLLECTIONS.INCIDENTS)
    .doc(incidentId)
    .collection('history')
    .doc();

  const doc = {
    id: ref.id,
    incidentId,
    type: event.type, // 'status_change' | 'assignment' | 'note' | 'ai_report_generated'
    fromStatus: event.fromStatus ?? null,
    toStatus: event.toStatus ?? null,
    actorId: event.actorId,
    actorName: event.actorName,
    note: event.note ?? null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(doc);
  return doc;
}

async function listEvents(incidentId, { limit = 100 } = {}) {
  const snap = await db()
    .collection(COLLECTIONS.INCIDENTS)
    .doc(incidentId)
    .collection('history')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map((d) => d.data());
}

module.exports = { recordEvent, listEvents };
