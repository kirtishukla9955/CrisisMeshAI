const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInsightReport } = require('../../ai/postDisasterAgent/schema');

// IMPORTANT: this file must run with ANTHROPIC_API_KEY unset/deleted so it
// genuinely exercises the "no API key" failure path end-to-end, not just
// the fallback generator in isolation (see aiFallback.test.js for that).
delete process.env.ANTHROPIC_API_KEY;

const { generatePostDisasterReport, buildDatasetSummary } = require('../../ai/postDisasterAgent/agent');

const SAMPLE_ENRICHED_INCIDENTS = [
  { incidentId: 'CRS-1', areaLabel: 'Zone 26.91, 75.79', primaryTag: 'flood', responseTimeMinutes: 45 },
  { incidentId: 'CRS-2', areaLabel: 'Zone 26.91, 75.79', primaryTag: 'trapped', responseTimeMinutes: 20 },
  { incidentId: 'CRS-3', areaLabel: 'Zone 26.95, 75.82', primaryTag: 'medical', responseTimeMinutes: null },
];

test('buildDatasetSummary: aggregates enriched incidents without leaking per-incident detail', () => {
  const summary = buildDatasetSummary(SAMPLE_ENRICHED_INCIDENTS);
  assert.equal(summary.totalIncidents, 3);
  assert.equal(summary.areaCounts['Zone 26.91, 75.79'], 2);
  assert.equal(summary.incidentsWithKnownResponseTime, 2);
  assert.equal(summary.avgResponseTimeMinutes, Math.round((45 + 20) / 2));
  // must not contain incidentId, reportIds, or any raw text — aggregate only
  assert.equal('incidentId' in summary, false);
});

test('generatePostDisasterReport: with NO ANTHROPIC_API_KEY, produces a valid deterministic rule-based report (Phase 30 critical test)', async () => {
  assert.equal(process.env.ANTHROPIC_API_KEY, undefined, 'test setup error: API key must be unset for this test');

  const periodCovered = { from: '2026-08-01T00:00:00.000Z', to: '2026-08-29T00:00:00.000Z' };
  const report = await generatePostDisasterReport(SAMPLE_ENRICHED_INCIDENTS, periodCovered, 7);

  assert.equal(report.generatedBy, 'rule_based_fallback');
  assert.equal(report.totalIncidents, 3);
  assert.ok(report.summaryText && report.summaryText.length > 0);
  assert.deepEqual(report.dataAnalyzed, { reportsAnalyzed: 7, incidentsAnalyzed: 3 });

  const { valid, errors } = validateInsightReport(report);
  assert.equal(valid, true, `report must satisfy the canonical schema even without an API key: ${errors.join(', ')}`);
});

test('generatePostDisasterReport: never throws and never returns an empty report on an empty incident list', async () => {
  const report = await generatePostDisasterReport([], { from: 'a', to: 'b' }, 0);
  assert.equal(report.totalIncidents, 0);
  assert.equal(validateInsightReport(report).valid, true);
});
