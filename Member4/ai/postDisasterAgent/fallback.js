/**
 * Deterministic, non-AI report generator for the canonical `insight_reports`
 * shape. Used whenever the LLM call fails for ANY reason (missing API key,
 * timeout, network error, 4xx/5xx, malformed JSON, schema validation
 * failure, unexpected response shape) — see agent.js. This is the
 * reliability guarantee from the project brief: "AI assists, never a
 * silent single point of failure." The dashboard shows
 * `generatedBy: "rule_based_fallback"` so authorities always know which
 * path produced a given report.
 *
 * Uses the exact same aggregate (`datasetSummary`) the AI path would have
 * received — same source data, deterministic math instead of a model call.
 */

/**
 * @param {Object} datasetSummary - see agent.js -> buildDatasetSummary()
 */
function generateFallbackInsightReport(datasetSummary) {
  const {
    totalIncidents = 0,
    areaCounts = {},
    avgResponseTimeMinutes = null,
    areaAvgResponseTimeMinutes = {},
    incidentsWithKnownResponseTime = 0,
    tagCounts = {},
  } = datasetSummary || {};

  const worstHitAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([areaName, incidentCount]) => ({ areaName, incidentCount }));

  const slowestResponseAreas = Object.entries(areaAvgResponseTimeMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([areaName]) => areaName);

  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];

  const summaryParts = [
    `Rule-based summary (AI report generation was unavailable): ${totalIncidents} resolved incident(s) recorded in this period.`,
  ];
  if (worstHitAreas.length > 0) {
    summaryParts.push(`${worstHitAreas[0].areaName} had the highest incident count (${worstHitAreas[0].incidentCount}).`);
  }
  if (avgResponseTimeMinutes !== null) {
    summaryParts.push(`Average response time across ${incidentsWithKnownResponseTime} incident(s) with known timing was ${avgResponseTimeMinutes} minutes.`);
  } else {
    summaryParts.push('Insufficient timestamp data was available to compute an average response time.');
  }
  if (topTag) {
    summaryParts.push(`The most common incident type was "${topTag[0]}" (${topTag[1]} incident(s)).`);
  }

  return {
    totalIncidents,
    worstHitAreas,
    avgResponseTimeMinutes,
    slowestResponseAreas,
    summaryText: summaryParts.join(' '),
    keyFindings: [
      `${totalIncidents} resolved incident(s) analyzed in this period.`,
      worstHitAreas.length
        ? `${worstHitAreas[0].areaName} was the most-affected area by incident count.`
        : 'No area-level data was available to rank impact.',
      avgResponseTimeMinutes !== null
        ? `Average response time was ${avgResponseTimeMinutes} minutes across incidents with known timing.`
        : 'Response-time data was insufficient for this period.',
    ],
    recommendations: [
      'Review this fallback report manually — it reflects counts and averages only, not qualitative pattern analysis.',
      'Re-run report generation once AI connectivity is restored for a full narrative analysis.',
    ],
    generatedBy: 'rule_based_fallback',
  };
}

module.exports = { generateFallbackInsightReport };
