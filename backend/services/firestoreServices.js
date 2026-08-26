// server/services/firestore.service.js
const { db } = require("../firebaseAdmin");

/**
 * Fetch all raw incident reports from Firestore.
 */
async function getAllIncidents() {
  const snapshot = await db.collection("incidents").get();
  
  const incidents = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    incidents.push({
      id: doc.id,
      lat: Number(data.lat || data.latitude || 0),
      lng: Number(data.lng || data.longitude || 0),
      severity: Number(data.severity || 0),
      priorityScore: Number(data.priorityScore || data.severity || 0),
      type: data.type || "unknown",
      reportCount: Number(data.reportCount || 1),
      timestamp: data.timestamp || new Date().toISOString(),
    });
  });

  return incidents;
}

module.exports = { getAllIncidents };