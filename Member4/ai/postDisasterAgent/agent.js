/**
 * Post-Disaster AI Agent (Round 2)
 *
 * Input:  a list of already-enriched resolved incidents (see
 *         backend/controllers/postDisasterController.js, which does the
 *         Firestore reads and response-time derivation) plus the period
 *         being reported on.
 * Output: a validated object matching the canonical `insight_reports`
 *         shape (see shared/schemas/incidentSchema.js), OR a rule-based
 *         fallback report with the same shape.
 *
 * This module never talks to Firestore or Express directly — it's a pure
 * function of (enrichedIncidents, periodCovered) -> report, which makes it
 * unit-testable without any live credentials (see TESTING.md, Phase 30).
 */

const { SYSTEM_PROMPT, buildUserPrompt } = require('./prompts');
const { validateInsightReport } = require('./schema');
const { generateFallbackInsightReport } = require('./fallback');

// Env-configurable model — never hardcoded in a way that blocks swapping
// providers/models. Defaults to a current Claude model if unset.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const MAX_TOKENS = 2000;
// Round 2 requirement: ~8s timeout so the live demo stays responsive even
// if the AI call hangs. (Round 1 used 20s — shortened per the final guide.)
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Reduces enriched incidents into the small, privacy-safe aggregate sent to
 * the LLM (and consumed identically by the fallback generator). No report
 * text, no reporter identifiers, no incident IDs — only counts, coarse area
 * labels, and derived response-time figures.
 *
 * @param {Array<{areaLabel:string, primaryTag:string, responseTimeMinutes:number|null}>} enrichedIncidents
 */
function buildDatasetSummary(enrichedIncidents) {
  const areaCounts = {};
  const tagCounts = {};
  const areaResponseTimes = {}; // areaLabel -> number[]
  const allResponseTimes = [];

  for (const inc of enrichedIncidents) {
    const area = inc.areaLabel || 'Unknown Area';
    areaCounts[area] = (areaCounts[area] || 0) + 1;

    if (inc.primaryTag) tagCounts[inc.primaryTag] = (tagCounts[inc.primaryTag] || 0) + 1;

    if (typeof inc.responseTimeMinutes === 'number' && inc.responseTimeMinutes >= 0) {
      allResponseTimes.push(inc.responseTimeMinutes);
      if (!areaResponseTimes[area]) areaResponseTimes[area] = [];
      areaResponseTimes[area].push(inc.responseTimeMinutes);
    }
  }

  const avgResponseTimeMinutes = allResponseTimes.length
    ? Math.round(allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length)
    : null;

  const areaAvgResponseTimeMinutes = {};
  Object.entries(areaResponseTimes).forEach(([area, times]) => {
    areaAvgResponseTimeMinutes[area] = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  });

  return {
    totalIncidents: enrichedIncidents.length,
    areaCounts,
    tagCounts,
    avgResponseTimeMinutes,
    areaAvgResponseTimeMinutes,
    incidentsWithKnownResponseTime: allResponseTimes.length,
  };
}

/**
 * Calls the Claude API with a hard 8s timeout via AbortController. Throws
 * on any failure (network, timeout, non-2xx, invalid JSON) — the caller is
 * responsible for catching and falling back. The API key is read from
 * process.env only and is never sent to or readable by the frontend.
 */
async function callClaude(datasetSummary, periodCovered) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set.');
  }

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
        messages: [{ role: 'user', content: buildUserPrompt(datasetSummary, periodCovered) }],
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
 * Main entry point. NEVER throws and NEVER returns an empty/null report —
 * always resolves to a valid canonical insight-report object, either
 * AI-generated or rule-based fallback. Every documented AI-failure mode
 * (missing key, timeout, network error, 4xx/5xx, malformed JSON, schema
 * validation failure, unexpected shape) routes to the same fallback path.
 *
 * @param {Array} enrichedIncidents
 * @param {{from: string, to: string}} periodCovered - ISO date strings
 * @param {number} reportsAnalyzed - count of underlying report docs read (for dataAnalyzed)
 * @returns {Promise<Object>} canonical insight_reports fields (minus reportGenId/generatedAt/periodCovered timestamps)
 */
async function generatePostDisasterReport(enrichedIncidents, periodCovered, reportsAnalyzed = 0) {
  const datasetSummary = buildDatasetSummary(enrichedIncidents);
  const dataAnalyzed = { reportsAnalyzed, incidentsAnalyzed: enrichedIncidents.length };

  try {
    const raw = await callClaude(datasetSummary, periodCovered);
    const { valid, errors } = validateInsightReport(raw);

    if (!valid) {
      console.warn('[Member4] AI insight report failed schema validation, falling back.', errors);
      return { ...generateFallbackInsightReport(datasetSummary), dataAnalyzed };
    }

    return {
      totalIncidents: raw.totalIncidents,
      worstHitAreas: raw.worstHitAreas,
      avgResponseTimeMinutes: raw.avgResponseTimeMinutes,
      slowestResponseAreas: raw.slowestResponseAreas,
      summaryText: raw.summaryText,
      keyFindings: raw.keyFindings || [],
      recommendations: raw.recommendations || [],
      generatedBy: 'ai',
      dataAnalyzed,
    };
  } catch (err) {
    // Catches: missing key (thrown explicitly above), timeout (AbortError),
    // network error, non-2xx, malformed JSON (JSON.parse throw), and any
    // other unexpected failure.
    console.warn('[Member4] AI insight report generation failed, using fallback:', err.message);
    return { ...generateFallbackInsightReport(datasetSummary), dataAnalyzed };
  }
}

module.exports = { generatePostDisasterReport, buildDatasetSummary };
