/**
 * Validates the structured JSON the LLM is asked to return.
 * If this validation fails (malformed/missing fields), the agent throws and
 * agent.js falls back to the rule-based generator — the LLM output is never
 * passed to the frontend un-validated.
 */

function isString(v) { return typeof v === 'string'; }
function isNumber(v) { return typeof v === 'number' && !Number.isNaN(v); }
function isStringArray(v) { return Array.isArray(v) && v.every(isString); }

/**
 * @param {any} data - parsed JSON from the LLM response
 * @returns {{valid: boolean, errors: string[]}}
 */
function validatePostDisasterReport(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response is not a JSON object.'] };
  }

  if (!isString(data.executiveSummary) || !data.executiveSummary.trim()) {
    errors.push('executiveSummary must be a non-empty string.');
  }

  if (!data.impact || typeof data.impact !== 'object') {
    errors.push('impact must be an object.');
  } else {
    if (!isNumber(data.impact.totalIncidents)) errors.push('impact.totalIncidents must be a number.');
    if (!isNumber(data.impact.criticalIncidents)) errors.push('impact.criticalIncidents must be a number.');
    if (!isStringArray(data.impact.affectedAreas || [])) errors.push('impact.affectedAreas must be a string array.');
  }

  if (!isStringArray(data.hardestHitAreas)) errors.push('hardestHitAreas must be a string array.');
  if (!data.responsePerformance || typeof data.responsePerformance !== 'object') {
    errors.push('responsePerformance must be an object.');
  }
  if (!Array.isArray(data.infrastructureImpact)) errors.push('infrastructureImpact must be an array.');
  if (!isStringArray(data.keyFindings) || data.keyFindings.length === 0) {
    errors.push('keyFindings must be a non-empty string array.');
  }
  if (!isStringArray(data.recommendations)) errors.push('recommendations must be a string array.');
  if (!isNumber(data.confidence) || data.confidence < 0 || data.confidence > 1) {
    errors.push('confidence must be a number between 0 and 1.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePostDisasterReport };
