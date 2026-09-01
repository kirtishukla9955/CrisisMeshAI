/**
 * Deterministic, non-AI report generator.
 *
 * Used whenever the LLM call fails, times out, exceeds quota, or returns
 * output that fails schema validation. This is the reliability guarantee
 * from the project brief: "AI assists, never a silent single point of
 * failure." The dashboard shows `generatedBy: "rule_based_fallback"` so
 * authorities always know which path produced a given report.
 */

const { INCIDENT_STATUS } = require('../../shared/constants/statuses');

/**
 * @param {Object} datasetSummary - same aggregated shape passed to the LLM
 *   (see ai/postDisasterAgent/agent.js -> buildDatasetSummary)
 */
function generateFallbackReport(datasetSummary) {
  const {
    totalIncidents = 0,
    criticalIncidents = 0,
    highSeverityIncidents = 0,
    resolvedIncidents = 0,
    areaCounts = {},
    categoryCounts = {},
    statusCounts = {},
    avgResponseTimeMinutes = null,
  } = datasetSummary || {};

  const hardestHitAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area]) => area);

  const incidentBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

  const unresolvedCount = totalIncidents - (statusCounts[INCIDENT_STATUS.RESOLVED] || 0);

  return {
    executiveSummary:
      `Rule-based summary (AI report generation was unavailable): ${totalIncidents} incident(s) were recorded, ` +
      `of which ${criticalIncidents} were critical and ${highSeverityIncidents} were high severity. ` +
      `${resolvedIncidents} incident(s) have been marked resolved; ${unresolvedCount} remain open.`,
    impact: {
      totalIncidents,
      criticalIncidents,
      highSeverityIncidents,
      affectedAreas: Object.keys(areaCounts),
      estimatedAffectedPopulation: null,
    },
    hardestHitAreas,
    responsePerformance: {
      averageResponseTimeMinutes: avgResponseTimeMinutes,
      slowestIncidents: [],
      fastestRespondingAreas: [],
      unresolvedCount,
    },
    incidentBreakdown,
    infrastructureImpact: [],
    keyFindings: [
      `${totalIncidents} total incident(s) recorded in this dataset.`,
      hardestHitAreas.length
        ? `${hardestHitAreas[0]} had the highest report volume.`
        : 'No area-level data was available to rank impact.',
      `${unresolvedCount} incident(s) remain unresolved at time of generation.`,
    ],
    recommendations: [
      'Review unresolved and escalated incidents manually — this fallback report does not perform qualitative analysis.',
      'Re-run AI report generation once connectivity/API access is restored for a full narrative analysis.',
    ],
    confidence: 0.4, // fixed, conservative — this is a formula, not a model judgment
    generatedBy: 'rule_based_fallback',
  };
}

module.exports = { generateFallbackReport };
