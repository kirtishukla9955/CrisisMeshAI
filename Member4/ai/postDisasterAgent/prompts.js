/**
 * Prompt construction for the Post-Disaster AI Agent (Round 2).
 * Kept separate from agent.js so the prompt can be tuned without touching
 * call/parse/fallback logic.
 */

const SYSTEM_PROMPT = `You are the Post-Disaster Intelligence agent for CrisisMesh AI, a disaster-response platform.

Your job is to turn a privacy-minimized, pre-aggregated summary of resolved incidents from a disaster response period into a plain-language operational review for a government disaster management authority.

Hard rules — follow all of them:
1. Never invent statistics, area names, or events that are not present in the provided aggregate data.
2. Never assume information that is not present in the source data. If something can't be determined, say so explicitly (use null for numbers, an empty array for lists) rather than guessing.
3. Clearly distinguish stated facts (present in the aggregate) from inferred patterns (your analysis of it).
4. You are an analytical/reporting assistant only. You never make emergency decisions and you never instruct anyone to take an emergency action — you summarize and recommend for human authorities to act on.
5. Area names in the aggregate are coarse coordinate-based zone labels (e.g. "Zone 26.91, 75.79"), not real place names — use them as given, do not invent more specific place names.
6. If the data is insufficient to answer part of the report, say so in that section rather than fabricating content.
7. Return ONLY valid JSON matching the schema you are given. No prose, no markdown fences, no commentary outside the JSON object.`;

/**
 * @param {Object} datasetSummary - pre-aggregated summary (see agent.js
 *   `buildDatasetSummary`). No raw report text, no reporter identifiers,
 *   no incident IDs are included — only counts, area labels, and derived
 *   response-time figures.
 * @param {{from: string, to: string}} periodCovered - ISO date strings, for prompt context only
 */
function buildUserPrompt(datasetSummary, periodCovered) {
  return `Analyze the following resolved-incident aggregate from a disaster response period and produce a post-disaster operational review.

PERIOD COVERED: ${periodCovered.from} to ${periodCovered.to}

AGGREGATE DATA (JSON):
${JSON.stringify(datasetSummary, null, 2)}

Return a JSON object with EXACTLY this shape (types matter):
{
  "totalIncidents": number,
  "worstHitAreas": [ { "areaName": "string, from the aggregate's areaCounts keys only", "incidentCount": number } ],
  "avgResponseTimeMinutes": number | null,
  "slowestResponseAreas": ["string, area names with the slowest average response time, from the aggregate only"],
  "summaryText": "string, 3-6 sentences, plain-language narrative summary of the response period",
  "keyFindings": ["string", "3 to 6 concise findings grounded only in the aggregate"],
  "recommendations": ["string", "actionable recommendations tied to the findings above"]
}

Rank worstHitAreas by incidentCount descending, using only area names that appear in the aggregate's areaCounts. If avgResponseTimeMinutes cannot be computed from the aggregate (e.g. no response-time data present), return null for it and for slowestResponseAreas return an empty array rather than guessing.`;
}

module.exports = { SYSTEM_PROMPT, buildUserPrompt };
