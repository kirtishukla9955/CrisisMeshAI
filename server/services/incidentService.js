const admin = require('firebase-admin');
const { db, COLLECTIONS } = require('./firestoreService');
const { notFound } = require('../utils/httpErrors');
const auditService = require('./auditService');

/**
 * Reads incidents for the authority dashboard.
 * Consumes the shared `incidents` collection populated by Member 3's AI
 * Prioritization Agent (with location/geo fields from Member 2). Does not
 * write to fields it doesn't own — see shared/DATA_CONTRACT.md.
 */
async function listIncidents({ status, severity, limit = 200 } = {}) {
  let query = db().collection(COLLECTIONS.INCIDENTS).orderBy('priorityScore', 'desc').limit(limit);

  if (status) query = query.where('status', '==', status);
  if (severity) query = query.where('severity', '==', severity);

  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getIncident(id) {
  const doc = await db().collection(COLLECTIONS.INCIDENTS).doc(id).get();
  if (!doc.exists) throw notFound(`Incident "${id}" not found.`);
  return { id: doc.id, ...doc.data() };
}

async function listReportsForIncident(incidentId) {
  const snap = await db()
    .collection(COLLECTIONS.REPORTS)
    .where('incidentId', '==', incidentId)
    .orderBy('createdAt', 'asc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Updates status (Member 4-owned mutation). Validation of the transition
 * itself happens in validators/incidentValidators.js before this is called.
 */
async function updateStatus(id, { status, authorityNote }, authority) {
  const ref = db().collection(COLLECTIONS.INCIDENTS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw notFound(`Incident "${id}" not found.`);

  const current = snap.data();

  await ref.update({
    status,
    authorityNote: authorityNote ?? current.authorityNote ?? null,
    lastActionBy: authority.uid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await auditService.recordEvent(id, {
    type: 'status_change',
    fromStatus: current.status,
    toStatus: status,
    actorId: authority.uid,
    actorName: authority.name,
    note: authorityNote || null,
  });

  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
}

async function addNote(id, { note }, authority) {
  const ref = db().collection(COLLECTIONS.INCIDENTS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw notFound(`Incident "${id}" not found.`);

  await ref.update({ authorityNote: note, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

  await auditService.recordEvent(id, {
    type: 'note',
    actorId: authority.uid,
    actorName: authority.name,
    note,
  });

  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
}

async function assignResponder(id, { responderId, responderName }, authority) {
  const ref = db().collection(COLLECTIONS.INCIDENTS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw notFound(`Incident "${id}" not found.`);

  await ref.update({
    assignedResponderId: responderId,
    assignedResponderName: responderName,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await auditService.recordEvent(id, {
    type: 'assignment',
    actorId: authority.uid,
    actorName: authority.name,
    note: `Assigned responder ${responderName || responderId}`,
  });

  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
}

module.exports = {
  listIncidents,
  getIncident,
  listReportsForIncident,
  updateStatus,
  addNote,
  assignResponder,
};
