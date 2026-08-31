const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeIncident, normalizeReport } = require('../../shared/normalizeIncident');
const { INCIDENT_STATUS, CONFIDENCE, SCORING_METHOD, TAG } = require('../../shared/constants/statuses');

const incidentsSeed = require('../../demo/seed-data/incidents.seed.json');
const reportsSeed = require('../../demo/seed-data/reports.seed.json');
const volunteersSeed = require('../../demo/seed-data/volunteers.seed.json');
const historySeed = require('../../demo/seed-data/incidentHistory.seed.json');

test('seed incidents: every incident normalizes with zero legacy-mapping warnings', () => {
  for (const raw of incidentsSeed.incidents) {
    const normalized = normalizeIncident(raw, raw.incidentId);
    assert.equal(
      normalized._meta.usedLegacyMapping,
      false,
      `${raw.incidentId} triggered legacy mapping: ${normalized._meta.warnings.join('; ')}`
    );
  }
});

test('seed incidents: all statuses, confidence values, and scoring methods are canonical', () => {
  const validStatuses = new Set(Object.values(INCIDENT_STATUS));
  const validConfidence = new Set(Object.values(CONFIDENCE));
  const validMethods = new Set(Object.values(SCORING_METHOD));
  const validTags = new Set(Object.values(TAG));

  for (const inc of incidentsSeed.incidents) {
    assert.ok(validStatuses.has(inc.status), `${inc.incidentId} has invalid status "${inc.status}"`);
    assert.ok(validConfidence.has(inc.confidence), `${inc.incidentId} has invalid confidence "${inc.confidence}"`);
    assert.ok(validMethods.has(inc.scoringMethod), `${inc.incidentId} has invalid scoringMethod "${inc.scoringMethod}"`);
    assert.ok(validTags.has(inc.primaryTag), `${inc.incidentId} has invalid primaryTag "${inc.primaryTag}"`);
  }
});

test('seed incidents: cover critical, high, moderate, and resolved+review scenarios', () => {
  const severities = incidentsSeed.incidents.map((i) => normalizeIncident(i, i.incidentId).severity);
  assert.ok(severities.includes('critical'));
  assert.ok(severities.includes('moderate'));
  assert.ok(incidentsSeed.incidents.some((i) => i.status === INCIDENT_STATUS.RESOLVED));
  assert.ok(incidentsSeed.incidents.some((i) => i.needsHumanReview === true));
  assert.ok(incidentsSeed.incidents.some((i) => i.scoringMethod === SCORING_METHOD.RULE_BASED_FALLBACK));
});

test('seed reports: every report normalizes with zero legacy-mapping warnings', () => {
  for (const raw of reportsSeed.reports) {
    const { createdAtMinutesAgo, ...rest } = raw;
    const normalized = normalizeReport(rest, raw.reportId);
    assert.equal(
      normalized._meta.usedLegacyMapping,
      false,
      `${raw.reportId} triggered legacy mapping: ${normalized._meta.warnings.join('; ')}`
    );
  }
});

test('seed data: every incident.reportIds entry resolves to a real seeded report', () => {
  const reportIdSet = new Set(reportsSeed.reports.map((r) => r.reportId));
  for (const inc of incidentsSeed.incidents) {
    for (const rid of inc.reportIds) {
      assert.ok(reportIdSet.has(rid), `${inc.incidentId} references missing report ${rid}`);
    }
  }
});

test('seed data: every incident.suggestedVolunteers entry resolves to a real seeded volunteer', () => {
  const volunteerIdSet = new Set(volunteersSeed.volunteers.map((v) => v.volunteerId));
  for (const inc of incidentsSeed.incidents) {
    for (const v of inc.suggestedVolunteers) {
      assert.ok(volunteerIdSet.has(v.volunteerId), `${inc.incidentId} references missing volunteer ${v.volunteerId}`);
    }
  }
});

test('seed data: resolved incidents have seeded history ending in a resolved status_change', () => {
  const resolvedIncidents = incidentsSeed.incidents.filter((i) => i.status === INCIDENT_STATUS.RESOLVED);
  for (const inc of resolvedIncidents) {
    const events = historySeed.history[inc.incidentId];
    assert.ok(events && events.length > 0, `${inc.incidentId} is resolved but has no seeded history`);
    assert.ok(
      events.some((e) => e.type === 'status_change' && e.toStatus === 'resolved'),
      `${inc.incidentId} history has no resolved status_change event`
    );
  }
});
