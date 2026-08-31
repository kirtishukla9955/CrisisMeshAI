const admin = require('firebase-admin');
const { db, COLLECTIONS } = require('../services/firestoreService');
const auditService = require('../services/auditService');
const incidentService = require('../services/incidentService');
const { generatePostDisasterReport } = require('../../ai/postDisasterAgent/agent');
const { normalizeIncident, deriveAreaLabel } = require('../../shared/normalizeIncident');
const { INCIDENT_STATUS } = require('../../shared/constants/statuses');
const { badRequest, notFound } = require('../utils/httpErrors');

const DEFAULT_PERIOD_DAYS = 30;

function toDate(value, fallback) {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw badRequest(`Invalid date value: "${value}"`);
  return d;
}

function timestampToMillis(ts) {
  if (!ts) return null;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * For one resolved incident, derives:
 *  - the earliest report.createdAt among its reportIds (proxy for "when
 *    this started" — canonical incidents have no createdAt of their own)
 *  - the earliest history event where toStatus === "resolved" (falling
 *    back to incident.updatedAt) as the resolution timestamp
 *  - responseTimeMinutes = resolution - earliest report time, or null if
 *    either side is unavailable. Never invented.
 *
 * See ai/postDisasterAgent/README.md "Known limitation" for why this
 * approach exists.
 */
async function enrichResolvedIncident(incident) {
  const [reports, history] = await Promise.all([
    incidentService.listReportsForIncident(incident),
    auditService.listEvents(incident.incidentId, { limit: 200 }),
  ]);

  const reportTimes = reports
    .map((r) => timestampToMillis(r.createdAt))
    .filter((t) => t !== null);
  const earliestReportMillis = reportTimes.length ? Math.min(...reportTimes) : null;

  const resolvedEvents = history
    .filter((e) => e.type === 'status_change' && e.toStatus === INCIDENT_STATUS.RESOLVED)
    .map((e) => timestampToMillis(e.timestamp))
    .filter((t) => t !== null);
  const resolutionMillis = resolvedEvents.length
    ? Math.min(...resolvedEvents)
    : timestampToMillis(incident.updatedAt);

  let responseTimeMinutes = null;
  if (earliestReportMillis !== null && resolutionMillis !== null && resolutionMillis >= earliestReportMillis) {
    responseTimeMinutes = Math.round((resolutionMillis - earliestReportMillis) / 60000);
  }

  return {
    incidentId: incident.incidentId,
    areaLabel: deriveAreaLabel(incident.centerLocation),
    primaryTag: incident.primaryTag,
    resolutionMillis,
    responseTimeMinutes,
    reportCountAnalyzed: reports.length,
  };
}

/**
 * POST /api/post-disaster/report
 * Body: { from?: ISO date string, to?: ISO date string }
 * Defaults to the last 30 days if omitted.
 *
 * Only resolved incidents whose derived resolution time falls inside the
 * period are included. Incidents with an undeterminable resolution time
 * are excluded from the period-filtered set (see enrichResolvedIncident)
 * rather than guessed into it — never invents inclusion.
 */
async function generateReport(req, res, next) {
  try {
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - DEFAULT_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const from = toDate(req.body?.from, defaultFrom);
    const to = toDate(req.body?.to, now);

    if (from > to) throw badRequest('`from` must be before `to`.');

    const snap = await db()
      .collection(COLLECTIONS.INCIDENTS)
      .where('status', '==', INCIDENT_STATUS.RESOLVED)
      .get();

    const resolvedIncidents = snap.docs.map((d) => normalizeIncident(d.data(), d.id));

    if (resolvedIncidents.length === 0) {
      throw badRequest('No resolved incidents exist yet. Generate a report once incidents have been resolved.');
    }

    const enriched = await Promise.all(resolvedIncidents.map(enrichResolvedIncident));

    const inPeriod = enriched.filter(
      (e) => e.resolutionMillis !== null && e.resolutionMillis >= from.getTime() && e.resolutionMillis <= to.getTime()
    );
    const excludedForUnknownResolution = enriched.length - inPeriod.length;

    if (inPeriod.length === 0) {
      throw badRequest(
        'No resolved incidents have a determinable resolution time within the requested period.',
        { totalResolvedIncidents: resolvedIncidents.length, excludedForUnknownResolution }
      );
    }

    const reportsAnalyzed = inPeriod.reduce((sum, e) => sum + e.reportCountAnalyzed, 0);
    const periodCovered = { from: from.toISOString(), to: to.toISOString() };

    const generated = await generatePostDisasterReport(inPeriod, periodCovered, reportsAnalyzed);

    const ref = db().collection(COLLECTIONS.INSIGHT_REPORTS).doc();
    const doc = {
      reportGenId: ref.id,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      periodCovered: {
        from: admin.firestore.Timestamp.fromDate(from),
        to: admin.firestore.Timestamp.fromDate(to),
      },
      ...generated,
      generatedByAuthorityId: req.authority.uid,
      // Not part of the canonical schema, kept for transparency in the UI.
      excludedForUnknownResolution,
    };
    await ref.set(doc);

    // Audit trail: one lightweight note per incident analyzed rather than
    // a full event per incident, to keep this a single batched write.
    const batch = db().batch();
    inPeriod.slice(0, 200).forEach((e) => {
      const historyRef = db().collection(COLLECTIONS.INCIDENTS).doc(e.incidentId).collection('history').doc();
      batch.set(historyRef, {
        id: historyRef.id,
        incidentId: e.incidentId,
        type: 'insight_report_generated',
        fromStatus: null,
        toStatus: null,
        actorId: req.authority.uid,
        actorName: req.authority.name,
        note: `Included in insight report ${ref.id} (${generated.generatedBy}).`,
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
    const doc = await db().collection(COLLECTIONS.INSIGHT_REPORTS).doc(req.params.id).get();
    if (!doc.exists) throw notFound(`Insight report "${req.params.id}" not found.`);
    res.status(200).json({ report: { reportGenId: doc.id, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/post-disaster/report/latest */
async function getLatestReport(req, res, next) {
  try {
    const snap = await db()
      .collection(COLLECTIONS.INSIGHT_REPORTS)
      .orderBy('generatedAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) return res.status(200).json({ report: null });
    const doc = snap.docs[0];
    res.status(200).json({ report: { reportGenId: doc.id, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateReport, getReport, getLatestReport };
