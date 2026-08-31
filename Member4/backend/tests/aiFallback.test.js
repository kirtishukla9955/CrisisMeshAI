const test = require('node:test');
const assert = require('node:assert/strict');
const { generateFallbackInsightReport } = require('../../ai/postDisasterAgent/fallback');
const { validateInsightReport } = require('../../ai/postDisasterAgent/schema');

test('generateFallbackInsightReport: produces schema-valid output from a realistic aggregate', () => {
  const datasetSummary = {
    totalIncidents: 3,
    areaCounts: { 'Zone 26.91, 75.79': 2, 'Zone 26.95, 75.82': 1 },
    tagCounts: { flood: 2, medical: 1 },
    avgResponseTimeMinutes: 40,
    areaAvgResponseTimeMinutes: { 'Zone 26.91, 75.79': 30, 'Zone 26.95, 75.82': 60 },
    incidentsWithKnownResponseTime: 3,
  };
  const report = generateFallbackInsightReport(datasetSummary);
  assert.equal(report.generatedBy, 'rule_based_fallback');
  assert.equal(report.totalIncidents, 3);
  assert.equal(report.worstHitAreas[0].areaName, 'Zone 26.91, 75.79');
  assert.equal(report.slowestResponseAreas[0], 'Zone 26.95, 75.82');

  const { valid, errors } = validateInsightReport(report);
  assert.equal(valid, true, `fallback output must satisfy the same schema as AI output: ${errors.join(', ')}`);
});

test('generateFallbackInsightReport: never throws on an empty dataset', () => {
  const report = generateFallbackInsightReport({
    totalIncidents: 0,
    areaCounts: {},
    tagCounts: {},
    avgResponseTimeMinutes: null,
    areaAvgResponseTimeMinutes: {},
    incidentsWithKnownResponseTime: 0,
  });
  assert.equal(report.totalIncidents, 0);
  assert.deepEqual(report.worstHitAreas, []);
  assert.equal(report.avgResponseTimeMinutes, null);
  assert.ok(report.summaryText.includes('Insufficient timestamp data'));
  assert.equal(validateInsightReport(report).valid, true);
});

test('generateFallbackInsightReport: never throws on completely missing/undefined input', () => {
  const report = generateFallbackInsightReport(undefined);
  assert.equal(report.totalIncidents, 0);
  assert.equal(validateInsightReport(report).valid, true);
});

test('generateFallbackInsightReport: is deterministic — same input produces same output', () => {
  const input = {
    totalIncidents: 5,
    areaCounts: { A: 3, B: 2 },
    tagCounts: { flood: 5 },
    avgResponseTimeMinutes: 20,
    areaAvgResponseTimeMinutes: { A: 15, B: 25 },
    incidentsWithKnownResponseTime: 5,
  };
  const r1 = generateFallbackInsightReport(input);
  const r2 = generateFallbackInsightReport(input);
  assert.deepEqual(r1, r2);
});
