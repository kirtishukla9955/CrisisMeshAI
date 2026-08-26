const { INCIDENT_STATUS, STATUS_TRANSITIONS } = require('../../shared/constants/statuses');
const { badRequest, conflict } = require('../utils/httpErrors');

const VALID_STATUSES = new Set(Object.values(INCIDENT_STATUS));

/**
 * Validates a PATCH /api/incidents/:id/status request body.
 * Throws HttpError on failure; returns the sanitized body on success.
 */
function validateStatusUpdate(body, currentStatus) {
  const { status, authorityNote } = body || {};

  if (!status || typeof status !== 'string') {
    throw badRequest('`status` is required and must be a string.');
  }

  if (!VALID_STATUSES.has(status)) {
    throw badRequest(`\`status\` must be one of: ${[...VALID_STATUSES].join(', ')}`, { received: status });
  }

  if (authorityNote !== undefined && typeof authorityNote !== 'string') {
    throw badRequest('`authorityNote` must be a string when provided.');
  }

  if (authorityNote && authorityNote.length > 2000) {
    throw badRequest('`authorityNote` must be 2000 characters or fewer.');
  }

  if (currentStatus && currentStatus !== status) {
    const allowed = STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      throw conflict(
        `Cannot transition incident from "${currentStatus}" to "${status}".`,
        { currentStatus, requestedStatus: status, allowedNextStatuses: allowed },
      );
    }
  }

  return { status, authorityNote: authorityNote || null };
}

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

function validateAssignment(body) {
  const { responderId, responderName } = body || {};
  if (!responderId || typeof responderId !== 'string') {
    throw badRequest('`responderId` is required and must be a string.');
  }
  return { responderId, responderName: responderName || null };
}

module.exports = { validateStatusUpdate, validateNote, validateAssignment };
