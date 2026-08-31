/**
 * Validates the structured JSON the LLM is asked to return, against the
 * canonical `insight_reports` shape from the Round 2 Full-Stack Build
 * Guide, plus Member 4's documented extension fields (see
 * shared/schemas/incidentSchema.js -> InsightReport typedef).
 *
 * If this validation fails for ANY reason — missing field, wrong type,
 * malformed JSON that never made it here — agent.js falls back to the
 * deterministic rule-based generator. The LLM's raw output is never
 * written to Firestore or shown to the frontend unvalidated.
 */

function isString(v) { return typeof v === 'string'; }
function isNumber(v) { return typeof v === 'number' && !Number.isNaN(v); }
function isNullableNumber(v) { return v === null || isNumber(v); }
function isStringArray(v) { return Array.isArray(v) && v.every(isString); }

/**
 * @param {any} data - parsed JSON from the LLM response
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateInsightReport(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response is not a JSON object.'] };
  }

  // --- Canonical fields (guide-defined; required) ---
  if (!isNumber(data.totalIncidents) || data.totalIncidents < 0) {
    errors.push('totalIncidents must be a non-negative number.');
  }

  if (!Array.isArray(data.worstHitAreas)) {
    errors.push('worstHitAreas must be an array.');
  } else {
    data.worstHitAreas.forEach((area, i) => {
      if (!area || typeof area !== 'object') { errors.push(`worstHitAreas[${i}] must be an object.`); return; }
      if (!isString(area.areaName)) errors.push(`worstHitAreas[${i}].areaName must be a string.`);
      if (!isNumber(area.incidentCount)) errors.push(`worstHitAreas[${i}].incidentCount must be a number.`);
    });
  }

  if (!isNullableNumber(data.avgResponseTimeMinutes)) {
    errors.push('avgResponseTimeMinutes must be a number or null.');
  }

  if (!isStringArray(data.slowestResponseAreas)) {
    errors.push('slowestResponseAreas must be a string array.');
  }

  if (!isString(data.summaryText) || !data.summaryText.trim()) {
    errors.push('summaryText must be a non-empty string.');
  }

  // --- Member 4 documented extension fields (optional but type-checked if present) ---
  if (data.keyFindings !== undefined && !isStringArray(data.keyFindings)) {
    errors.push('keyFindings, if present, must be a string array.');
  }
  if (data.recommendations !== undefined && !isStringArray(data.recommendations)) {
    errors.push('recommendations, if present, must be a string array.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateInsightReport };
