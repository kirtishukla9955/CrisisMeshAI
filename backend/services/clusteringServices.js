// server/services/clustering.service.js
const turf = require("@turf/turf");

/**
 * Clusters raw incident reports using Turf DBSCAN algorithm.
 * @param {Array} incidents - List of raw incident objects
 * @param {number} maxDistanceKm - Distance threshold for clustering in km (default 50km)
 * @returns {Array} List of clustered + unclustered incident objects matching the target shape
 */
function clusterIncidents(incidents, maxDistanceKm = 50) {
  if (!incidents || incidents.length === 0) return [];

  // Convert raw incidents into GeoJSON Points
  const points = incidents.map((inc) =>
    turf.point([inc.lng, inc.lat], { ...inc })
  );
  const featureCollection = turf.featureCollection(points);

  // Perform DBSCAN clustering
  const clustered = turf.clustersDbscan(featureCollection, maxDistanceKm, {
    units: "kilometers",
  });

  const clustersMap = {};
  const unclustered = [];

  clustered.features.forEach((feature) => {
    const clusterId = feature.properties.dbscan;
    const props = feature.properties;

    if (clusterId === undefined || clusterId === "noise") {
      unclustered.push({
        id: props.id,
        lat: props.lat,
        lng: props.lng,
        severity: props.severity,
        priorityScore: props.priorityScore,
        type: props.type,
        reportCount: props.reportCount || 1,
        timestamp: props.timestamp,
      });
    } else {
      if (!clustersMap[clusterId]) {
        clustersMap[clusterId] = [];
      }
      clustersMap[clusterId].push(props);
    }
  });

  // Aggregate clustered features into combined cluster objects
  const aggregatedClusters = Object.keys(clustersMap).map((cId) => {
    const group = clustersMap[cId];

    const avgLat = group.reduce((sum, item) => sum + item.lat, 0) / group.length;
    const avgLng = group.reduce((sum, item) => sum + item.lng, 0) / group.length;
    const maxSeverity = Math.max(...group.map((item) => item.severity));
    const maxPriority = Math.max(...group.map((item) => item.priorityScore));
    const totalReports = group.reduce(
      (sum, item) => sum + (item.reportCount || 1),
      0
    );

    // Pick most prominent type in cluster
    const typeCounts = {};
    group.forEach((item) => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });
    const dominantType = Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b
    );

    return {
      id: `cluster-${cId}`,
      lat: Number(avgLat.toFixed(6)),
      lng: Number(avgLng.toFixed(6)),
      severity: maxSeverity,
      priorityScore: maxPriority,
      type: dominantType,
      reportCount: totalReports,
      timestamp: group[0].timestamp,
    };
  });

  return [...aggregatedClusters, ...unclustered];
}

module.exports = { clusterIncidents };