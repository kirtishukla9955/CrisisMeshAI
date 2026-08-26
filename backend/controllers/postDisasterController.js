const admin = require('firebase-admin');
const { db, COLLECTIONS } = require('../services/firestoreService');
const { generatePostDisasterReport } = require('../../ai/postDisasterAgent/agent');
const auditService = require('../services/auditService');
const { notFound, badRequest } = require('../utils/httpErrors');

/**
 * POST /api/post-disaster/report
 * Body: { eventId?: string }  — optional filter if the main schema scopes
 * incidents to a disaster event; omit to analyze all current incidents.
 */
async function generateReport(req, res, next) {
  try {
    const { eventId } = req.body || {};

    let incidentsQuery = db().collection(COLLECTIONS.INCIDENTS);
    if (eventId) incidentsQuery = incidentsQuery.where('eventId', '==', eventId);
    const incidentsSnap = await incidentsQuery.get();
    const incidents = incidentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (incidents.length === 0) {
      throw badRequest('No incidents found to analyze. Generate a report once incident data exists.');
    }

    const reportsSnap = await db().collection(COLLECTIONS.REPORTS).get();
    const reports = reportsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const report = await generatePostDisasterReport(incidents, reports);

    const ref = db().collection(COLLECTIONS.POST_DISASTER_REPORTS).doc();
    const doc = {
      id: ref.id,
      ...report,
      eventId: eventId || null,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      generatedByAuthorityId: req.authority.uid,
    };
    await ref.set(doc);

    // Audit trail: note this against every incident analyzed, lightweight —
    // one batched write rather than N sequential writes.
    const batch = db().batch();
    incidents.slice(0, 200).forEach((inc) => {
      const historyRef = db().collection(COLLECTIONS.INCIDENTS).doc(inc.id).collection('history').doc();
      batch.set(historyRef, {
        id: historyRef.id,
        incidentId: inc.id,
        type: 'ai_report_generated',
        fromStatus: null,
        toStatus: null,
        actorId: req.authority.uid,
        actorName: req.authority.name,
        note: `Included in post-disaster report ${ref.id} (${report.generatedBy}).`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    res.status(201).json({ report: doc });
  } catch (err) {
    next(err);
  }
}

/** GET /api/post-disaster/report/:id */
async function getReport(req, res, next) {
  try {
    const doc = await db().collection(COLLECTIONS.POST_DISASTER_REPORTS).doc(req.params.id).get();
    if (!doc.exists) throw notFound(`Post-disaster report "${req.params.id}" not found.`);
    res.status(200).json({ report: { id: doc.id, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/post-disaster/report — latest report, for the dashboard default view */
async function getLatestReport(req, res, next) {
  try {
    const snap = await db()
      .collection(COLLECTIONS.POST_DISASTER_REPORTS)
      .orderBy('generatedAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) return res.status(200).json({ report: null });
    const doc = snap.docs[0];
    res.status(200).json({ report: { id: doc.id, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateReport, getReport, getLatestReport };
