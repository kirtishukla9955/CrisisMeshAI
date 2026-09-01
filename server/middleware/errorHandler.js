/**
 * Central error handler for Member 4's routes.
 * Mount this AFTER incidentRoutes/postDisasterRoutes are registered.
 * Does not replace the main project's global error handler if one exists —
 * see INTEGRATION_GUIDE.md for how to compose the two.
 */

const { HttpError } = require('../utils/httpErrors');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }

  console.error('[Member4] Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { errorHandler };
