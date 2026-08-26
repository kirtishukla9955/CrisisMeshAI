const { db, admin } = require('../src/firebase');
const crypto = require('crypto');

function uuidv4() {
  return crypto.randomUUID();
}

async function seed() {
  console.log("Seeding dummy reports for clustering test...");
  const batch = db.batch();

  const reports = [
    {
      reportId: uuidv4(),
      source: 'app',
      reporterId: 'user1',
      text: 'Huge flood near the main bridge, water is rising fast!',
      tag: 'flood',
      isEmergency: true,
      location: { lat: 12.9716, lng: 77.5946 }, 
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      reportId: uuidv4(),
      source: 'sms',
      reporterPhone: '+1234567890',
      text: 'HELP trapped I am stuck on my roof at main bridge',
      tag: 'trapped',
      isEmergency: true,
      location: { lat: 12.9717, lng: 77.5945 }, // Close to first, should cluster
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      reportId: uuidv4(),
      source: 'app',
      reporterId: 'user2',
      text: 'Someone is bleeding, needs medical attention near the big banyan tree.',
      tag: 'injury',
      isEmergency: true,
      location: { lat: 12.9816, lng: 77.6046 }, // Far away, should be a separate cluster
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  for (const r of reports) {
    const ref = db.collection('reports').doc(r.reportId);
    batch.set(ref, r);
  }

  await batch.commit();
  console.log("Seeded 3 reports.");
  process.exit(0);
}

seed();
