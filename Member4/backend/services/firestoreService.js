/**
 * Thin Firestore accessor.
 *
 * IMPORTANT: This does NOT call admin.initializeApp(). The main project
 * (whoever owns server bootstrap — likely Member 1 or 2's backend entry
 * file) is expected to initialize firebase-admin once at startup. This
 * file just grabs the already-initialized Firestore instance so Member 4's
 * code never conflicts with that setup. See INTEGRATION_GUIDE.md.
 */

const admin = require('firebase-admin');

function db() {
  if (!admin.apps.length) {
    throw new Error(
      '[Member4] firebase-admin has not been initialized yet. ' +
      'Make sure admin.initializeApp() runs in the main server entry file before Member 4 routes are mounted.'
    );
  }
  return admin.firestore();
}

const COLLECTIONS = Object.freeze({
  INCIDENTS: 'incidents',
  REPORTS: 'reports',
  VOLUNTEERS: 'volunteers',
  // Round 2 canonical collection name per the Full-Stack Build Guide.
  // Round 1 used `postDisasterReports` — retired, see shared/DATA_CONTRACT.md
  // for the migration note. Do not write to the old collection.
  INSIGHT_REPORTS: 'insight_reports',
});

module.exports = { db, COLLECTIONS };
