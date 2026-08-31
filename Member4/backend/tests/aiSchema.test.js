const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInsightReport } = require('../../ai/postDisasterAgent/schema');

const VALID = {
  totalIncidents: 12,
  worstHitAreas: [{ areaName: 'Zone 26.91, 75.79', incidentCount: 5 }],
  avgResponseTimeMinutes: 34,
  slowestResponseAreas: ['Zone 26.91, 75.79'],
  summaryText: 'Twelve incidents were resolved during the period.',
  keyFindings: ['Finding one.'],
  recommendations: ['Recommendation one.'],
};

test('validateInsightReport: accepts a fully valid canonical report', () => {
  const { valid, errors } = validateInsightReport(VALID);
  assert.equal(valid, true);
  assert.deepEqual(errors, []);
});

test('validateInsightReport: accepts null avgResponseTimeMinutes and empty slowestResponseAreas', () => {
  const { valid } = validateInsightReport({ ...VALID, avgResponseTimeMinutes: null, slowestResponseAreas: [] });
  assert.equal(valid, true);
});

test('validateInsightReport: rejects non-object input', () => {
  assert.equal(validateInsightReport(null).valid, false);
  assert.equal(validateInsightReport('a string').valid, false);
  assert.equal(validateInsightReport(42).valid, false);
});

test('validateInsightReport: rejects missing totalIncidents', () => {
  const { valid, errors } = validateInsightReport({ ...VALID, totalIncidents: undefined });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes('totalIncidents')));
});

test('validateInsightReport: rejects malformed worstHitAreas entries', () => {
  const { valid, errors } = validateInsightReport({ ...VALID, worstHitAreas: [{ areaName: 'X' }] });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes('incidentCount')));
});

test('validateInsightReport: rejects empty summaryText', () => {
  const { valid } = validateInsightReport({ ...VALID, summaryText: '   ' });
  assert.equal(valid, false);
});

test('validateInsightReport: rejects non-array keyFindings/recommendations when present', () => {
  assert.equal(validateInsightReport({ ...VALID, keyFindings: 'not an array' }).valid, false);
  assert.equal(validateInsightReport({ ...VALID, recommendations: 'not an array' }).valid, false);
});

test('validateInsightReport: keyFindings/recommendations are optional', () => {
  const { keyFindings, recommendations, ...withoutExtensions } = VALID;
  assert.equal(validateInsightReport(withoutExtensions).valid, true);
});
