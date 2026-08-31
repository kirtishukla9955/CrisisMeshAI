const { INCIDENT_STATUS, STATUS_TRANSITIONS } = require('../../shared/constants/statuses');
const { badRequest, conflict } = require('../utils/httpErrors');

const VALID_STATUSES = new Set(Object.values(INCIDENT_STATUS));

/**
 * Validates a PATCH /api/incidents/:id/status request body against the
 * canonical Round 2 flow: new -> acknowledged -> in_progress -> resolved.
 * No lateral moves, no skipping states, no arbitrary client-provided
 * status — this is the only place status mutation is allowed to happen.
 *
 * `note` is optional and, if present, is recorded on the audit history
 * event only — it is never written onto the incident document itself,
 * since Member 4 does not own any incident field except `status`.
 *
 * Throws HttpError on failure; returns the sanitized body on success.
 */
function validateStatusUpdate(body, currentStatus) {
  const { status, note } = body || {};

  if (!status || typeof status !== 'string') {
    throw badRequest('`status` is required and must be a string.');
  }

  if (!VALID_STATUSES.has(status)) {
    throw badRequest(
      `\`status\` must be one of: ${[...VALID_STATUSES].join(', ')}`,
      { received: status }
    );
  }

  if (note !== undefined && typeof note !== 'string') {
    throw badRequest('`note` must be a string when provided.');
  }
  if (note && note.length > 2000) {
    throw badRequest('`note` must be 2000 characters or fewer.');
  }

  if (currentStatus && !VALID_STATUSES.has(currentStatus)) {
    // Legacy/unrecognized current status — shared/normalizeIncident.js
    // should already have mapped this before it reaches the validator, so
    // reaching here means something upstream skipped normalization.
    throw conflict(
      `Incident's current status ("${currentStatus}") is not a recognized Round 2 status. It must be normalized before it can be transitioned.`,
      { currentStatus }
    );
  }

  if (currentStatus && currentStatus !== status) {
    const allowed = STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      throw conflict(
        `Cannot transition incident from "${currentStatus}" to "${status}". The canonical flow only moves forward: new -> acknowledged -> in_progress -> resolved.`,
        { currentStatus, requestedStatus: status, allowedNextStatuses: allowed }
      );
    }
  }

  if (currentStatus === status) {
    throw conflict(`Incident is already "${status}".`, { currentStatus, requestedStatus: status });
  }

  return { status, note: note || null };
}

/** POST /api/incidents/:id/notes — audit-only, no incident field is touched. */
function validateNote(body) {
  const { note } = body || {};
  if (!note || typeof note !== 'string' || !note.trim()) {
    throw badRequest('`note` is required and must be a non-empty string.');
  }
  if (note.length > 2000) {
    throw badRequest('`note` must be 2000 characters or fewer.');
  }
  return { note: note.trim() };
}

/**
 * POST /api/incidents/:id/confirm-volunteer — authority confirms one of
 * Member 3's `suggestedVolunteers` entries as the actual assignment. This
 * is recorded as an audit event only; it does NOT write to the incident
 * document (Member 4 does not own a volunteer-assignment field on
 * `incidents`, and must not fabricate one — see shared/DATA_CONTRACT.md).
 */
function validateVolunteerConfirmation(body) {
  const { volunteerId, volunteerName } = body || {};
  if (!volunteerId || typeof volunteerId !== 'string') {
    throw badRequest('`volunteerId` is required and must be a string.');
  }
  if (volunteerName !== undefined && typeof volunteerName !== 'string') {
    throw badRequest('`volunteerName` must be a string when provided.');
  }
  return { volunteerId, volunteerName: volunteerName || null };
}

module.exports = { validateStatusUpdate, validateNote, validateVolunteerConfirmation };
