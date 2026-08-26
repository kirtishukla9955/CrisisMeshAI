const { db, admin } = require('../firebase');
const turf = require('@turf/turf');
const { getAIScore } = require('./scoringService');
const { matchVolunteers } = require('./matchingService');

async function runClusteringJob() {
  console.log("Running Clustering Job...");
  try {
    const snapshot = await db.collection('reports')
      .where('status', '==', 'new')
      .get();
      
    if (snapshot.empty) {
      console.log("No new reports to cluster.");
      return;
    }

    const reports = [];
    snapshot.forEach(doc => {
      reports.push({ id: doc.id, ...doc.data() });
    });

    // We only cluster reports that have a location.
    // Reports without location will be clustered by tag/locationText or just made into their own incident.
    const locatedReports = reports.filter(r => r.location && typeof r.location.lat === 'number' && typeof r.location.lng === 'number');
    const unlocatedReports = reports.filter(r => !r.location || typeof r.location.lat !== 'number' || typeof r.location.lng !== 'number');

    // Convert to GeoJSON for Turf
    const points = locatedReports.map(r => turf.point([r.location.lng, r.location.lat], { report: r }));
    
    let clusters = [];
    
    if (points.length > 0) {
      const featureCollection = turf.featureCollection(points);
      // DBScan: maxDistance in km (0.5 km = 500m)
      const clustered = turf.clustersDbscan(featureCollection, 0.5);
      
      // Group by cluster ID
      const clusterMap = {};
      turf.featureEach(clustered, (currentFeature) => {
        const clusterId = currentFeature.properties.cluster !== undefined ? currentFeature.properties.cluster : `noise_${currentFeature.properties.report.id}`;
        if (!clusterMap[clusterId]) clusterMap[clusterId] = [];
        clusterMap[clusterId].push(currentFeature.properties.report);
      });
      
      clusters = Object.values(clusterMap);
    }
    
    // Add unlocated reports as individual clusters (MVP)
    unlocatedReports.forEach(r => clusters.push([r]));

    // Process each cluster
    for (const clusterReports of clusters) {
      // Find center location (average of located reports in this cluster)
      const locs = clusterReports.filter(r => r.location).map(r => r.location);
      let centerLocation = null;
      if (locs.length > 0) {
        centerLocation = {
          lat: locs.reduce((sum, l) => sum + l.lat, 0) / locs.length,
          lng: locs.reduce((sum, l) => sum + l.lng, 0) / locs.length,
        };
      }

      // Check if there is an existing active incident nearby (within 500m)
      // MVP: We'll query all active incidents and check distance
      let targetIncidentId = null;
      let existingReports = [];
      
      if (centerLocation) {
        const activeIncidentsSnap = await db.collection('incidents')
          .where('status', 'in', ['new', 'acknowledged', 'in_progress'])
          .get();
          
        for (const doc of activeIncidentsSnap.docs) {
          const inc = doc.data();
          if (inc.centerLocation) {
            const dist = turf.distance(
              turf.point([centerLocation.lng, centerLocation.lat]), 
              turf.point([inc.centerLocation.lng, inc.centerLocation.lat])
            );
            if (dist <= 0.5) { // 500 meters
              targetIncidentId = inc.incidentId;
              existingReports = inc.reportIds || [];
              break;
            }
          }
        }
      }

      const reportIds = clusterReports.map(r => r.reportId || r.id);
      const combinedReportIds = [...new Set([...existingReports, ...reportIds])];
      
      // We need to pass the FULL reports (including existing ones) to AI for scoring
      let allReportsForAI = [...clusterReports];
      if (existingReports.length > 0) {
        // Fetch existing reports to feed into AI
        const existingDocs = await Promise.all(existingReports.map(id => db.collection('reports').doc(id).get()));
        existingDocs.forEach(d => {
          if (d.exists) allReportsForAI.push(d.data());
        });
      }

      // 2. Score the cluster via AI or Fallback
      const scoreResult = await getAIScore(allReportsForAI);
      
      const primaryTagCounts = {};
      allReportsForAI.forEach(r => {
        primaryTagCounts[r.tag] = (primaryTagCounts[r.tag] || 0) + 1;
      });
      const primaryTag = Object.keys(primaryTagCounts).sort((a,b) => primaryTagCounts[b] - primaryTagCounts[a])[0] || 'other';
      
      const needsHumanReview = scoreResult.confidence === 'low' || scoreResult.scoringMethod === 'fallback_only';

      const incidentId = targetIncidentId || db.collection('incidents').doc().id;

      const incidentData = {
        incidentId,
        centerLocation,
        reportIds: combinedReportIds,
        reportCount: combinedReportIds.length,
        primaryTag,
        severitySummary: scoreResult.severitySummary,
        priorityScore: scoreResult.priorityScore,
        confidence: scoreResult.confidence,
        scoringMethod: scoreResult.scoringMethod,
        neededSkills: scoreResult.neededSkills,
        status: targetIncidentId ? undefined : 'new', // Don't overwrite status if existing
        needsHumanReview,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (!targetIncidentId) {
        incidentData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      // Write Incident
      await db.collection('incidents').doc(incidentId).set(incidentData, { merge: true });

      // Mark reports as reviewed
      const batch = db.batch();
      clusterReports.forEach(r => {
        const ref = db.collection('reports').doc(r.id);
        batch.update(ref, { status: 'reviewed' });
      });
      await batch.commit();

      // Trigger volunteer matching
      await matchVolunteers(incidentId, scoreResult.neededSkills, centerLocation);
    }

    console.log(`Clustering Job completed. Processed ${reports.length} reports.`);
  } catch (error) {
    console.error("Error in clustering job:", error);
  }
}

module.exports = { runClusteringJob };
