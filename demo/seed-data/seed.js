/**
 * DEMO DATA ONLY. Loads demo/seed-data/incidents.seed.json into Firestore
 * for local development/demo purposes. Do NOT run this against a
 * production project.
 *
 * Usage:
 *   node demo/seed-data/seed.js
 *
 * Requires the same Firebase Admin credentials as the main backend
 * (GOOGLE_APPLICATION_CREDENTIALS env var or default application
 * credentials). Does not call admin.initializeApp() with hardcoded
 * secrets — reuses whatever the environment already provides.
 */

const admin = require('firebase-admin');
const path = require('path');
const seed = require('./incidents.seed.json');

if (!admin.apps.length) {
  admin.initializeApp(); // relies on GOOGLE_APPLICATION_CREDENTIALS
}

async function run() {
  const db = admin.firestore();
  const batch = db.batch();

  seed.incidents.forEach((incident) => {
    const ref = db.collection('incidents').doc(incident.id);
    batch.set(ref, {
      ...incident,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  seed.reports.forEach((report) => {
    const ref = db.collection('reports').doc(report.id);
    batch.set(ref, {
      ...report,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Seeded ${seed.incidents.length} incidents and ${seed.reports.length} reports (DEMO DATA).`);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
