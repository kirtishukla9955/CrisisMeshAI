const admin = require('firebase-admin');
const { db, COLLECTIONS } = require('./firestoreService');
const { notFound } = require('../utils/httpErrors');
const auditService = require('./auditService');
const { normalizeIncident, normalizeReport } = require('../../shared/normalizeIncident');

/**
 * Reads incidents for the authority dashboard. Every document is passed
 * through normalizeIncident() before leaving this module — nothing
 * downstream (controllers, frontend) should ever see a raw Firestore doc.
 *
 * Firestore field names in the query itself (`status`) are canonical
 * Round 2 values, so this only returns correct results once documents are
 * either already canonical or get normalized on the way out. Filtering by
 * status server-side on legacy data is a known limitation — see
 * shared/DATA_CONTRACT.md "Known limitation: filtering legacy data."
 */
async function listIncidents({ status, limit = 200 } = {}) {
  let query = db().collection(COLLECTIONS.INCIDENTS).orderBy('priorityScore', 'desc').limit(limit);
  if (status) query = query.where('status', '==', status);

  const snap = await query.get();
  return snap.docs.map((d) => normalizeIncident(d.data(), d.id));
}

async function getIncident(id) {
  const doc = await db().collection(COLLECTIONS.INCIDENTS).doc(id).get();
  if (!doc.exists) throw notFound(`Incident "${id}" not found.`);
  return normalizeIncident(doc.data(), doc.id);
}

/**
 * Round 2 reports have no `incidentId` foreign key — they're looked up via
 * `incident.reportIds[]`. Uses a batched getAll() rather than N sequential
 * reads. Missing/deleted report docs are skipped rather than throwing, so
 * one bad reference doesn't break the whole incident view.
 */
async function listReportsForIncident(incident) {
  const reportIds = incident.reportIds || [];
  if (reportIds.length === 0) return [];

  const refs = reportIds.map((id) => db().collection(COLLECTIONS.REPORTS).doc(id));
  const docs = await db().getAll(...refs);

  return docs.filter((d) => d.exists).map((d) => normalizeReport(d.data(), d.id));
}

/**
 * Fetches Volunteer documents referenced by an incident's
 * suggestedVolunteers array, for display purposes only. Member 4 reads
 * `volunteers` read-only — never writes to it.
 */
async function listSuggestedVolunteerDetails(incident) {
  const ids = (incident.suggestedVolunteers || [])
    .map((v) => v.volunteerId || v.id)
    .filter(Boolean);
  if (ids.length === 0) return [];

  const refs = ids.map((id) => db().collection(COLLECTIONS.VOLUNTEERS).doc(id));
  const docs = await db().getAll(...refs);
  return docs.filter((d) => d.exists).map((d) => ({ volunteerId: d.id, ...d.data() }));
}

/**
 * Updates ONLY `status` (+ bumps `updatedAt`). This is the single incident
 * field Member 4 is contractually allowed to write. An optional `note` is
 * recorded on the audit event, never on the incident document.
 */
async function updateStatus(id, { status, note }, authority) {
  const ref = db().collection(COLLECTIONS.INCIDENTS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw notFound(`Incident "${id}" not found.`);

  const current = normalizeIncident(snap.data(), snap.id);

  await ref.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await auditService.recordEvent(id, {
    type: 'status_change',
    fromStatus: current.status,
    toStatus: status,
    actorId: authority.uid,
    actorName: authority.name,
    note: note || null,
  });

  const updated = await ref.get();
  return normalizeIncident(updated.data(), updated.id);
}

/**
 * Records an authority note as an audit event only. No incident field is
 * written — see shared/schemas/incidentSchema.js for why notes live in
 * history rather than on the incident document.
 */
async function addNote(id, { note }, authority) {
  const doc = await db().collection(COLLECTIONS.INCIDENTS).doc(id).get();
  if (!doc.exists) throw notFound(`Incident "${id}" not found.`);

  await auditService.recordEvent(id, {
    type: 'note',
    actorId: authority.uid,
    actorName: authority.name,
    note,
  });

  return normalizeIncident(doc.data(), doc.id);
}

/**
 * Records the authority's confirmation of one of Member 3's
 * `suggestedVolunteers` entries as an audit event. Does not write to the
 * incident document — see backend/validators/incidentValidators.js for why.
 */
async function confirmVolunteer(id, { volunteerId, volunteerName }, authority) {
  const doc = await db().collection(COLLECTIONS.INCIDENTS).doc(id).get();
  if (!doc.exists) throw notFound(`Incident "${id}" not found.`);

  const incident = normalizeIncident(doc.data(), doc.id);
  const isSuggested = (incident.suggestedVolunteers || []).some(
    (v) => (v.volunteerId || v.id) === volunteerId
  );

  await auditService.recordEvent(id, {
    type: 'volunteer_confirmed',
    actorId: authority.uid,
    actorName: authority.name,
    note: isSuggested
      ? `Confirmed suggested volunteer: ${volunteerName || volunteerId}`
      : `Confirmed volunteer (not in AI-suggested list): ${volunteerName || volunteerId}`,
  });

  return normalizeIncident(doc.data(), doc.id);
}

module.exports = {
  listIncidents,
  getIncident,
  listReportsForIncident,
  listSuggestedVolunteerDetails,
  updateStatus,
  addNote,
  confirmVolunteer,
};
