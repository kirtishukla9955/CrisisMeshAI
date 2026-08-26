/**
 * Prompt construction for the Post-Disaster AI Agent.
 * Kept separate from agent.js so the prompt can be iterated on/tuned
 * without touching call/parse/fallback logic.
 */

const SYSTEM_PROMPT = `You are the Post-Disaster Intelligence agent for CrisisMesh AI, a disaster-response platform.

Your job is to turn a structured dump of incident and report data from a single disaster event into a plain-language operational review for a government disaster management authority.

Hard rules — follow all of them:
1. Never invent statistics, locations, or events that are not present in the provided data.
2. Never assume information that is not present in the source data. If something can't be determined, say so explicitly rather than guessing.
3. Clearly distinguish stated facts (present in the data) from inferred patterns (your analysis of the data).
4. You are an analytical/reporting assistant only. You never make emergency decisions, and you never instruct anyone to take an emergency action — you summarize and recommend for human authorities to act on.
5. If the provided data is insufficient to answer part of the report, say so in that section rather than fabricating content.
6. Return ONLY valid JSON matching the schema you are given. No prose, no markdown fences, no commentary outside the JSON object.`;

/**
 * @param {Object} datasetSummary - pre-aggregated, privacy-safe summary of
 *   incidents/reports (see agent.js `buildDatasetSummary`). We send a
 *   summary rather than raw documents to keep the prompt small and to avoid
 *   leaking unnecessary raw citizen data to the LLM provider.
 */
function buildUserPrompt(datasetSummary) {
  return `Analyze the following disaster-response dataset and produce a post-disaster operational review.

DATASET (JSON):
${JSON.stringify(datasetSummary, null, 2)}

Return a JSON object with EXACTLY this shape (types matter):
{
  "executiveSummary": "string, 3-5 sentences",
  "impact": {
    "totalIncidents": number,
    "criticalIncidents": number,
    "highSeverityIncidents": number,
    "affectedAreas": ["string", ...],
    "estimatedAffectedPopulation": number | null
  },
  "hardestHitAreas": ["string ranked most to least affected, based only on the data given"],
  "responsePerformance": {
    "averageResponseTimeMinutes": number | null,
    "slowestIncidents": ["string incident id or title", ...],
    "fastestRespondingAreas": ["string", ...],
    "unresolvedCount": number
  },
  "incidentBreakdown": [ { "category": "string", "count": number } ],
  "infrastructureImpact": ["string, only recurring infrastructure mentions actually present in the data (roads, bridges, electricity, water, communication, buildings)"],
  "keyFindings": ["string", "3 to 7 concise findings"],
  "recommendations": ["string", "actionable, tied to the findings above"],
  "confidence": number between 0 and 1 reflecting how complete/reliable this analysis is given the data volume and quality
}

If a numeric field cannot be determined from the data, use null rather than guessing. If affectedAreas, infrastructureImpact, or similar arrays have no support in the data, return an empty array rather than inventing entries.`;
}

module.exports = { SYSTEM_PROMPT, buildUserPrompt };
