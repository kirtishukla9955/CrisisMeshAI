const { db, admin } = require('../firebase');

function haversineDistance(loc1, loc2) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function matchVolunteers(incidentId, neededSkills, centerLocation) {
  if (!centerLocation || !centerLocation.lat || !centerLocation.lng) return [];

  const snapshot = await db.collection('volunteers')
    .where('isVerified', '==', true)
    .where('isAvailable', '==', true)
    .get();

  let matches = [];

  snapshot.forEach(doc => {
    const vol = doc.data();
    if (!vol.location || !vol.skills) return;

    const hasSkill = vol.skills.some(s => neededSkills.includes(s));
    if (hasSkill) {
      const distance = haversineDistance(centerLocation, vol.location);
      matches.push({
        volunteerId: vol.volunteerId,
        distance
      });
    }
  });

  matches.sort((a, b) => a.distance - b.distance);
  const topMatches = matches.slice(0, 5).map(m => m.volunteerId);

  // Update incident with suggested volunteers
  await db.collection('incidents').doc(incidentId).update({
    suggestedVolunteers: topMatches,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return topMatches;
}

module.exports = { matchVolunteers };
