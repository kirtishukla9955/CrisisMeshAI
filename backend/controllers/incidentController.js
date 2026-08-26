// backend/controllers/incidentController.js
const incidentService = require('../services/incidentService');
const auditService = require('../services/auditService');
const clusteringService = require('../services/clusteringService');
const firestoreService = require('../services/firestoreService');
const { validateStatusUpdate, validateNote, validateAssignment } = require('../validators/incidentValidators');

/** GET /api/incidents */
async function listIncidents(req, res, next) {
  try {
    const { status, severity } = req.query;
    const incidents = await incidentService.listIncidents({ status, severity });
    res.status(200).json({ incidents, count: incidents.length });
  } catch (err) {
    next(err);
  }
}

/** GET /api/incidents/:id */
async function getIncident(req, res, next) {
  try {
    const incident = await incidentService.getIncident(req.params.id);
    const reports = await incidentService.listReportsForIncident(req.params.id);
    res.status(200).json({ incident, reports });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/incidents/:id/status */
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

/** POST /api/incidents/:id/notes */
async function addNote(req, res, next) {
  try {
    const body = validateNote(req.body);
    const updated = await incidentService.addNote(req.params.id, body, req.authority);
    res.status(201).json({ incident: updated });
  } catch (err) {
    next(err);
  }
}

/** POST /api/incidents/:id/assign */
async function assignResponder(req, res, next) {
  try {
    const body = validateAssignment(req.body);
    const updated = await incidentService.assignResponder(req.params.id, body, req.authority);
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

/** GET /api/incidents/clustered */
async function getClusteredIncidents(req, res, next) {
  try {
    const { type, minSeverity, distance } = req.query;

    // Fetch raw reports (uses firestoreService or fallback to incidentService)
    let incidents = firestoreService.getAllIncidents 
      ? await firestoreService.getAllIncidents() 
      : await incidentService.listIncidents({});

    // Apply optional filter parameters
    if (type && type !== "all") {
      incidents = incidents.filter((inc) => inc.type === type);
    }
    if (minSeverity) {
      const minSevNum = Number(minSeverity);
      incidents = incidents.filter((inc) => inc.severity >= minSevNum);
    }

    const distanceKm = distance ? Number(distance) : 50;
    const result = clusteringService.clusterIncidents(incidents, distanceKm);

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listIncidents,
  getIncident,
  updateStatus,
  addNote,
  assignResponder,
  getHistory,
  getClusteredIncidents,
};