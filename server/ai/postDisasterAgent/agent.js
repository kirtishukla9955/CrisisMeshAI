/**
 * Post-Disaster AI Agent
 *
 * Input:  aggregated incident/report data for a disaster event (read from
 *         Firestore by backend/controllers/postDisasterController.js)
 * Output: a validated PostDisasterReport object (see shared/schemas), OR a
 *         rule-based fallback report with the same shape.
 *
 * This module never talks to Firestore or Express directly — it's a pure
 * function of (incidents, reports) -> report, which makes it easy to unit
 * test and easy for another member to reuse elsewhere if needed.
 */

const { SYSTEM_PROMPT, buildUserPrompt } = require('./prompts');
const { validatePostDisasterReport } = require('./schema');
const { generateFallbackReport } = require('./fallback');
const { INCIDENT_STATUS, SEVERITY } = require('../../shared/constants/statuses');

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2000;
const REQUEST_TIMEOUT_MS = 20000;

/**
 * Reduces raw incidents/reports into a small, privacy-safe aggregate the
 * LLM (and the fallback generator) can reason about, instead of shipping
 * full raw documents to a third-party API.
 */
function buildDatasetSummary(incidents, reports) {
  const areaCounts = {};
  const categoryCounts = {};
  const statusCounts = {};
  let criticalIncidents = 0;
  let highSeverityIncidents = 0;
  let resolvedIncidents = 0;
  let responseTimes = [];

  for (const inc of incidents) {
    if (inc.locationLabel) areaCounts[inc.locationLabel] = (areaCounts[inc.locationLabel] || 0) + 1;
    if (inc.category) categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
    if (inc.status) statusCounts[inc.status] = (statusCounts[inc.status] || 0) + 1;
    if (inc.severity === SEVERITY.CRITICAL) criticalIncidents += 1;
    if (inc.severity === SEVERITY.HIGH) highSeverityIncidents += 1;
    if (inc.status === INCIDENT_STATUS.RESOLVED) resolvedIncidents += 1;

    if (inc.createdAt && inc.resolvedAt) {
      const created = inc.createdAt.toMillis ? inc.createdAt.toMillis() : new Date(inc.createdAt).getTime();
      const resolved = inc.resolvedAt.toMillis ? inc.resolvedAt.toMillis() : new Date(inc.resolvedAt).getTime();
      if (resolved > created) responseTimes.push((resolved - created) / 60000);
    }
  }

  const avgResponseTimeMinutes = responseTimes.length
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;

  return {
    totalIncidents: incidents.length,
    totalReports: reports.length,
    criticalIncidents,
    highSeverityIncidents,
    resolvedIncidents,
    areaCounts,
    categoryCounts,
    statusCounts,
    avgResponseTimeMinutes,
  };
}

/**
 * Calls the Claude API with a hard timeout. Throws on any failure
 * (network, timeout, non-2xx, invalid JSON) — the caller is responsible
 * for catching and falling back.
 */
async function callClaude(datasetSummary) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(datasetSummary) }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Anthropic API returned ${response.status}: ${text.slice(0, 300)}`);
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    if (!textBlock) throw new Error('Anthropic API response contained no text block.');

    const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Main entry point. Never throws — always resolves to a valid report
 * object, either AI-generated or rule-based fallback.
 *
 * @param {Array} incidents
 * @param {Array} reports
 * @returns {Promise<Object>} PostDisasterReport-shaped object
 */
async function generatePostDisasterReport(incidents, reports) {
  const datasetSummary = buildDatasetSummary(incidents, reports);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[Member4] ANTHROPIC_API_KEY not set — using rule-based fallback report.');
    return { ...generateFallbackReport(datasetSummary), dataAnalyzed: summaryToDataAnalyzed(datasetSummary) };
  }

  try {
    const raw = await callClaude(datasetSummary);
    const { valid, errors } = validatePostDisasterReport(raw);

    if (!valid) {
      console.warn('[Member4] AI report failed schema validation, falling back.', errors);
      return { ...generateFallbackReport(datasetSummary), dataAnalyzed: summaryToDataAnalyzed(datasetSummary) };
    }

    return { ...raw, generatedBy: 'ai', dataAnalyzed: summaryToDataAnalyzed(datasetSummary) };
  } catch (err) {
    console.warn('[Member4] AI report generation failed, using fallback:', err.message);
    return { ...generateFallbackReport(datasetSummary), dataAnalyzed: summaryToDataAnalyzed(datasetSummary) };
  }
}

function summaryToDataAnalyzed(summary) {
  return { reportsAnalyzed: summary.totalReports, incidentsAnalyzed: summary.totalIncidents };
}

module.exports = { generatePostDisasterReport, buildDatasetSummary };
