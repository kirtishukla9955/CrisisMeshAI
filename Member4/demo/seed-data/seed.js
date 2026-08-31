/**
 * DEMO DATA ONLY. Loads demo/seed-data/*.seed.json into Firestore for
 * local development/demo purposes, in the canonical Round 2 shape.
 * Do NOT run this against a production project.
 *
 * Usage:
 *   node demo/seed-data/seed.js
 *
 * Requires Firebase Admin credentials through
 * GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Does not hardcode any secrets.
 */

const admin = require('../../backend/node_modules/firebase-admin');

const incidentsSeed = require('./incidents.seed.json');
const reportsSeed = require('./reports.seed.json');
const volunteersSeed = require('./volunteers.seed.json');
const historySeed = require('./incidentHistory.seed.json');

if (!admin.apps.length) {
  admin.initializeApp();
}

const NOW = Date.now();

const minutesAgoToTimestamp = (minutesAgo) =>
  admin.firestore.Timestamp.fromDate(
    new Date(NOW - minutesAgo * 60000)
  );

async function run() {
  const db = admin.firestore();

  // ------------------------------------------------------------
  // INCIDENTS
  // ------------------------------------------------------------

  const incidentBatch = db.batch();

  incidentsSeed.incidents.forEach((incident) => {
    const ref = db
      .collection('incidents')
      .doc(incident.incidentId);

    incidentBatch.set(ref, {
      ...incident,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await incidentBatch.commit();

  // ------------------------------------------------------------
  // REPORTS
  // ------------------------------------------------------------

  const reportBatch = db.batch();

  reportsSeed.reports.forEach((report) => {
    const { createdAtMinutesAgo, ...rest } = report;

    const ref = db
      .collection('reports')
      .doc(report.reportId);

    reportBatch.set(ref, {
      ...rest,
      createdAt: minutesAgoToTimestamp(createdAtMinutesAgo),
    });
  });

  await reportBatch.commit();

  // ------------------------------------------------------------
  // VOLUNTEERS
  // ------------------------------------------------------------

  const volunteerBatch = db.batch();

  volunteersSeed.volunteers.forEach((volunteer) => {
    const ref = db
      .collection('volunteers')
      .doc(volunteer.volunteerId);

    volunteerBatch.set(ref, {
      ...volunteer,
    });
  });

  await volunteerBatch.commit();

  // ------------------------------------------------------------
  // INCIDENT HISTORY
  // ------------------------------------------------------------

  const historyBatch = db.batch();

  Object.entries(historySeed.history).forEach(
    ([incidentId, events]) => {
      events.forEach((event) => {
        const { minutesAgo, ...rest } = event;

        const ref = db
          .collection('incidents')
          .doc(incidentId)
          .collection('history')
          .doc();

        historyBatch.set(ref, {
          id: ref.id,
          incidentId,
          ...rest,
          timestamp: minutesAgoToTimestamp(minutesAgo),
        });
      });
    }
  );

  await historyBatch.commit();

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------

  const historyEventCount = Object.values(
    historySeed.history
  ).reduce(
    (sum, events) => sum + events.length,
    0
  );

  console.log(
    `Seeded ${incidentsSeed.incidents.length} incidents, ` +
      `${reportsSeed.reports.length} reports, ` +
      `${volunteersSeed.volunteers.length} volunteers, and ` +
      `${historyEventCount} history events (DEMO DATA).`
  );
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});