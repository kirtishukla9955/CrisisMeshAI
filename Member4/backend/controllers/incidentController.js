const incidentService = require('../services/incidentService');
const auditService = require('../services/auditService');
const {
  validateStatusUpdate,
  validateNote,
  validateVolunteerConfirmation,
} = require('../validators/incidentValidators');

/** GET /api/incidents — canonical incidents, normalized. `status` filters by canonical value. */
async function listIncidents(req, res, next) {
  try {
    const { status } = req.query;
    const incidents = await incidentService.listIncidents({ status });
    res.status(200).json({ incidents, count: incidents.length });
  } catch (err) {
    next(err);
  }
}

/** GET /api/incidents/:id — incident + its reports (fetched via reportIds) + suggested volunteer details. */
async function getIncident(req, res, next) {
  try {
    const incident = await incidentService.getIncident(req.params.id);
    const [reports, suggestedVolunteerDetails] = await Promise.all([
      incidentService.listReportsForIncident(incident),
      incidentService.listSuggestedVolunteerDetails(incident),
    ]);
    res.status(200).json({ incident, reports, suggestedVolunteerDetails });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/incidents/:id/status — the only incident field Member 4 may write. */
async function updateStatus(req, res, next) {
  try {
    const current = await incidentService.getIncident(req.params.id);
    const body = validateStatusUpdate(req.body, current.status);
    const updated = await incidentService.updateStatus(req.params.id, body, req.authority);
    res.status(200).json({ incident: updated });
  } catch (err) {
    next(err);
  }
}

/** POST /api/incidents/:id/notes — audit-only, does not mutate the incident document. */
async function addNote(req, res, next) {
  try {
    const body = validateNote(req.body);
    const updated = await incidentService.addNote(req.params.id, body, req.authority);
    res.status(201).json({ incident: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/incidents/:id/confirm-volunteer — authority confirms one of
 * Member 3's suggestedVolunteers as the actual assignment. Audit-only.
 */
async function confirmVolunteer(req, res, next) {
  try {
    const body = validateVolunteerConfirmation(req.body);
    const updated = await incidentService.confirmVolunteer(req.params.id, body, req.authority);
    res.status(200).json({ incident: updated });
  } catch (err) {
    next(err);
  }
}

/** GET /api/incidents/:id/history */
async function getHistory(req, res, next) {
  try {
    const events = await auditService.listEvents(req.params.id);
    res.status(200).json({ events, count: events.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { listIncidents, getIncident, updateStatus, addNote, confirmVolunteer, getHistory };
